const axios = require("axios");
const Order = require("../models/Order"); // Update path if needed
const Store = require("../models/Store");
const admin = require("../config/firebase-admin");
const { updateOrderStatusesGHN } = require("../services/ghnSyncOrder");
const GHN_TOKEN = process.env.GHN_API_KEY;
const GHN_API_BASE_URL = process.env.GHN_API_BASE_URL;
const ghnAPI = axios.create({
  baseURL: GHN_API_BASE_URL,
  headers: {
    Token: GHN_TOKEN,
    "Content-Type": "application/json",
  },
});

const ghnController = {
  // 1. Tính phí giao hàng dự kiến
  calculateShippingFee: async (req, res) => {
    const { storeId, toDistrictId, toWardCode, weight, height, length, width } =
      req.body;
    try {
      const store = await Store.findById(storeId);
      if (!store || !store.ghnShopId || !store.districtId) {
        return res
          .status(400)
          .json({ message: "Store not valid or missing GHN info" });
      }
      const response = await ghnAPI.post(
        "/v2/shipping-order/fee",
        {
          from_district_id: store.districtId,
          to_district_id: toDistrictId,
          to_ward_code: toWardCode,
          height,
          length,
          weight,
          width,
          insurance_value: 0,
          service_type_id: 2,
        },
        { headers: { ShopId: store.ghnShopId } }
      );
      res.json(response.data.data);
    } catch (error) {
      res
        .status(500)
        .json({ message: error.response?.data?.message || "Lỗi tính phí GHN" });
    }
  },

  // 2. Tính thời gian giao hàng dự kiến
  estimateDeliveryTime: async (req, res) => {
    const { storeId, toDistrictId, toWardCode } = req.body;
    try {
      const store = await Store.findById(storeId);
      if (!store || !store.ghnShopId || !store.districtId) {
        return res
          .status(400)
          .json({ message: "Store not valid or missing GHN info" });
      }
      const response = await ghnAPI.post(
        "/v2/shipping-order/leadtime",
        {
          from_district_id: store.districtId,
          from_ward_code: store.wardCode,
          to_district_id: toDistrictId,
          to_ward_code: toWardCode,
          service_id: 53321,
        },
        { headers: { ShopId: store.ghnShopId } }
      );
      res.json(response.data.data);
    } catch (error) {
      res.status(500).json({ message: "Lỗi tính thời gian giao hàng" });
    }
  },

  createGHNOrder: async (req, res) => {
    const orderId = req.params.id;
    try {
      const order = await Order.findById(orderId).lean();
      if (!order) return res.status(404).json({ message: "Order not found" });

      const store = await Store.findById(order.storeId);
      if (!store || !store.ghnShopId || !store.districtId) {
        return res
          .status(400)
          .json({ message: "Store not valid or missing GHN info" });
      }

      const ghnOrderData = {
        payment_type_id: 1,
        note: "Giao hàng tiêu chuẩn",
        required_note: "KHONGCHOXEMHANG",
        from_name: store.name,
        from_phone: store.phoneNumber,
        from_address: store.address,
        from_ward_name: store.wardName,
        from_district_name: store.districtName,
        from_province_name: store.provinceName,
        to_name: order.name,
        to_phone: order.phone,
        to_address: order.address,
        to_ward_name: order.ward,
        to_district_name: order.district,
        to_province_name: order.city,
        weight: 1000,
        length: 20,
        width: 20,
        height: 20,
        cod_amount: order.totalPrice,
        items: order.products.map((p) => ({
          name: p.name,
          quantity: p.quantity,
        })),
        service_id: 53320,
        service_type_id: 2,
      };

      const response = await ghnAPI.post(
        "/v2/shipping-order/create",
        ghnOrderData,
        { headers: { ShopId: store.ghnShopId } }
      );

      const journeyLog = { status: "ready_to_pick", updated_date: new Date() };
      await Order.findByIdAndUpdate(orderId, {
        ghnOrderCode: response.data.data.order_code,
        status: "WaitingPickup",
        shippingStatus: "ready_to_pick",
        $push: { journeyLog: journeyLog },
      });

      // 🔥 Upload thông tin đơn hàng lên Firestore
      const orderSummary = {
        orderId: order._id.toString(),
        userId: order.userId,
        time: new Date().toISOString(),
        products: order.products.map((p) => ({
          name: p.name,
          image: p.image[0] || "",
          description: `Quantity: ${p.quantity} - Price: ${p.price}`,
        })),
      };

      await admin
        .firestore()
        .collection("notification")
        .doc(order._id.toString())
        .set(orderSummary);

      res.json(response.data.data);
    } catch (error) {
      res.status(500).json({
        message: error.response?.data?.message || "Lỗi tạo đơn GHN",
      });
    }
  },

  // 4. Lấy trạng thái đơn GHN
  getGHNOrderStatus: async (req, res) => {
    const ghnOrderCode = req.params.id;
    try {
      const response = await updateOrderStatusesGHN(ghnOrderCode);
      res.status(200).json("OK");
    } catch (error) {
      res.status(500).json({ message: "Lỗi lấy trạng thái GHN" });
    }
  },

  // 5. Đồng bộ trạng thái đơn từ GHN về DB
  syncGHNStatus: async (req, res) => {
    try {
      const orders = await Order.find({ ghnOrderCode: { $exists: true } });

      for (const order of orders) {
        try {
          const response = await ghnAPI.post("/v2/shipping-order/detail", {
            order_code: order.ghnOrderCode,
          });
          await Order.findByIdAndUpdate(order._id, {
            ghnStatus: response.data.data.status,
          });
        } catch (err) {
          console.error(`Sync error for order ${order._id}:`, err.message);
        }
      }

      res.json({ message: "Đã đồng bộ trạng thái GHN cho các đơn hàng." });
    } catch (error) {
      res.status(500).json({ message: "Lỗi đồng bộ trạng thái GHN" });
    }
  },

  // 6. Hủy đơn GHN
  cancelGHNOrder: async (req, res) => {
    const { ghnOrderCode } = req.body;
    try {
      const response = await ghnAPI.post("/v2/switch-status/cancel", {
        order_codes: [ghnOrderCode],
      });
      await Order.findOneAndUpdate({ ghnOrderCode }, { status: "Cancelled" });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Lỗi hủy đơn GHN" });
    }
  },

  getAvailableServices: async (req, res) => {
    const { storeId, to_district } = req.body;
    try {
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: "Không tìm thấy cửa hàng" });
      }
      console.log(store);
      const response = await ghnAPI.post(
        "/v2/shipping-order/available-services",
        {
          shop_id: store.ghnShopId,
          from_district: store.districtId,
          to_district: to_district,
        }
      );

      res.status(200).json(response.data.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách dịch vụ GHN:", error.message);
      res.status(500).json({
        message: "Không thể lấy danh sách dịch vụ GHN",
        detail: error.response?.data || error.message,
      });
    }
  },

  getProvinces: async (req, res) => {
    try {
      const response = await ghnAPI.get("/master-data/province");
      res.status(200).json(response.data.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách tinh thanh GHN:", error.message);
      res.status(500).json({
        message: "Không thể lấy danh sách tinh thanh GHN",
        detail: error.response?.data || error.message,
      });
    }
  },

  getDistricts: async (req, res) => {
    let { provinceId } = req.query;
    provinceId = parseInt(provinceId, 10);
    try {
      const response = await ghnAPI.post(`/master-data/district`, {
        province_id: provinceId,
      });
      res.status(200).json(response.data.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách quan huyen GHN:", error.message);
      res.status(500).json({
        message: "Không thể lấy danh sách quan huyen GHN",
        detail: error.response?.data || error.message,
      });
    }
  },

  getWards: async (req, res) => {
    let { districtId } = req.query;
    districtId = parseInt(districtId, 10);
    try {
      const response = await ghnAPI.post(`/master-data/ward?district_id`, {
        district_id: districtId,
      });
      res.status(200).json(response.data.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách phuong xa GHN:", error.message);
      res.status(500).json({
        message: "Không thể lấy danh sách phuong xa GHN",
        detail: error.response?.data || error.message,
      });
    }
  },
  searchAddress: async (req, res) => {
    const address = req.query.q;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&limit=1`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "MyShoppingApp/1.0 (trungtinh1620@gmail.com)",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch address from OSM" });
    }
  },
};

module.exports = ghnController;
