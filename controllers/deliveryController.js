const axios = require('axios');
const Order = require('../models/Order'); // Update path if needed
const Store = require('../models/Store');
const GHN_TOKEN = process.env.GHN_API_KEY;
const GHN_API_BASE_URL = process.env.GHN_API_BASE_URL;
const ghnAPI = axios.create({
    baseURL: GHN_API_BASE_URL,
    headers: {
        Token: GHN_TOKEN,
        'Content-Type': 'application/json'
    }
});

const ghnController = {
    // 1. Tính phí giao hàng dự kiến
    calculateShippingFee: async (req, res) => {
        const { storeId, toDistrictId, toWardCode, weight, height, length, width } = req.body;
        try {
            const store = await Store.findById(storeId);
            if (!store || !store.ghnShopId || !store.districtId) {
                return res.status(400).json({ message: 'Store not valid or missing GHN info' });
            }
            const response = await ghnAPI.post('/v2/shipping-order/fee', {
                from_district_id: store.districtId,
                to_district_id: toDistrictId,
                to_ward_code: toWardCode,
                height,
                length,
                weight,
                width,
                insurance_value: 0,
                service_type_id: 2
            }, { headers: { ShopId: store.ghnShopId } });
            res.json(response.data.data);
        } catch (error) {
            res.status(500).json({ message: error.response?.data?.message || 'Lỗi tính phí GHN' });
        }
    },

    // 2. Tính thời gian giao hàng dự kiến
    estimateDeliveryTime: async (req, res) => {
        const { storeId, toDistrictId, toWardCode } = req.body;
        try {
            const store = await Store.findById(storeId);
            if (!store || !store.ghnShopId || !store.districtId) {
                return res.status(400).json({ message: 'Store not valid or missing GHN info' });
            }
            const response = await ghnAPI.post('/v2/shipping-order/leadtime', {
                from_district_id: store.districtId,
                from_ward_code: store.wardCode,
                to_district_id: toDistrictId,
                to_ward_code: toWardCode,
                service_id: 53321
            }, { headers: { ShopId: store.ghnShopId } });
            res.json(response.data.data);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi tính thời gian giao hàng' });
        }
    },

    // 3. Tạo đơn hàng GHN sau khi shop duyệt
    createGHNOrder: async (req, res) => {
        const { orderId } = req.body;
        try {
            const order = await Order.findById(orderId).lean();
            if (!order) return res.status(404).json({ message: 'Order not found' });

            const ghnOrderData = {
                payment_type_id: 2,
                note: 'Giao hàng tiêu chuẩn',
                required_note: 'KHONGCHOXEMHANG',
                to_name: order.name,
                to_phone: order.phone,
                to_address: order.address,
                to_ward_code: order.toWardCode,
                to_district_id: order.toDistrictId,
                weight: 1000,
                length: 20,
                width: 20,
                height: 20,
                cod_amount: order.totalPrice,
                items: order.products.map(p => ({
                    name: p.name,
                    quantity: p.quantity
                })),
                service_id: 53320,
                service_type_id: 2
            };

            const response = await ghnAPI.post('/v2/shipping-order/create', ghnOrderData);
            await Order.findByIdAndUpdate(orderId, {
                ghnOrderCode: response.data.data.order_code,
                status: 'WaitingForPickup'
            });

            res.json(response.data.data);
        } catch (error) {
            res.status(500).json({ message: error.response?.data?.message || 'Lỗi tạo đơn GHN' });
        }
    },

    // 4. Lấy trạng thái đơn GHN
    getGHNOrderStatus: async (req, res) => {
        const { ghnOrderCode } = req.params;
        try {
            const response = await ghnAPI.post('/v2/shipping-order/detail', {
                order_code: ghnOrderCode
            });
            res.json(response.data.data);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi lấy trạng thái GHN' });
        }
    },

    // 5. Đồng bộ trạng thái đơn từ GHN về DB
    syncGHNStatus: async (req, res) => {
        try {
            const orders = await Order.find({ ghnOrderCode: { $exists: true } });

            for (const order of orders) {
                try {
                    const response = await ghnAPI.post('/v2/shipping-order/detail', {
                        order_code: order.ghnOrderCode
                    });
                    await Order.findByIdAndUpdate(order._id, { ghnStatus: response.data.data.status });
                } catch (err) {
                    console.error(`Sync error for order ${order._id}:`, err.message);
                }
            }

            res.json({ message: 'Đã đồng bộ trạng thái GHN cho các đơn hàng.' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi đồng bộ trạng thái GHN' });
        }
    },

    // 6. Hủy đơn GHN
    cancelGHNOrder: async (req, res) => {
        const { ghnOrderCode } = req.body;
        try {
            const response = await ghnAPI.post('/v2/switch-status/cancel', {
                order_codes: [ghnOrderCode]
            });
            await Order.findOneAndUpdate({ ghnOrderCode }, { status: 'Cancelled' });
            res.json(response.data);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi hủy đơn GHN' });
        }
    },

    getAvailableServices : async (req, res) => {
        const { storeId, to_district } = req.body;
        try {
            const store = await Store.findById(storeId);
            if (!store) {
                return res.status(404).json({ message: 'Không tìm thấy cửa hàng' });
            }
            console.log(store);
            const response = await ghnAPI.post('/v2/shipping-order/available-services', {
                shop_id: store.ghnShopId,
                from_district: store.districtId,
                to_district: to_district
            });

            res.status(200).json(response.data.data);
        } catch (error) {
            console.error('Lỗi lấy danh sách dịch vụ GHN:', error.message);
            res.status(500).json({
            message: 'Không thể lấy danh sách dịch vụ GHN',
            detail: error.response?.data || error.message
            });
        }
    },

    getProvinces : async (req, res) => {
        try {
            const response = await ghnAPI.get('/master-data/province');
            res.status(200).json(response.data.data);
        } catch (error) {
            console.error('Lỗi lấy danh sách tinh thanh GHN:', error.message);
            res.status(500).json({
            message: 'Không thể lấy danh sách tinh thanh GHN',
            detail: error.response?.data || error.message
            });
        }
    },

    getDistricts : async (req, res) => {
        const { provinceId } = req.body;
        try {
            const response = await ghnAPI.post(`/master-data/district`, {
                province_id: provinceId
            });
            res.status(200).json(response.data.data);
        } catch (error) {
            console.error('Lỗi lấy danh sách quan huyen GHN:', error.message);
            res.status(500).json({
            message: 'Không thể lấy danh sách quan huyen GHN',
            detail: error.response?.data || error.message
            });
        }
    },

    getWards : async (req, res) => {
        const { districtId } = req.body;
        console.log(districtId);
        try {
            const response = await ghnAPI.post(`/master-data/ward?district_id`, {
                district_id: districtId
            });
            res.status(200).json(response.data.data);
        } catch (error) {
            console.error('Lỗi lấy danh sách phuong xa GHN:', error.message);
            res.status(500).json({
            message: 'Không thể lấy danh sách phuong xa GHN',
            detail: error.response?.data || error.message
            });
        }
    },

};

module.exports = ghnController;
