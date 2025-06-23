const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Order = require("../models/Order"); // Adjust the path as needed
const Product = require("../models/Product"); // Adjust the path as needed
const Cart = require("../models/Cart"); // Adjust the path as needed
const Promotion = require("../models/Promotion");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Parameter = require('../models/Parameter');
const User = require("../models/User");
const Store = require("../models/Store");
const StorePromotion = require("../models/StorePromotion");
const orderController = {
  createDirectOrders: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const orders = req.body; // 'orders' là danh sách các đơn hàng theo từng cửa hàng

      if (!orders || orders.length === 0) {
        return res.status(400).json({ message: "No orders provided" });
      }

      const createdOrders = [];

      for (const order of orders) {
        const {
          storeId,
          userId,
          name,
          phone,
          address,
          city,
          district,
          ward,
          longitude,
          latitude,
          estimatedDate,
          products,
          promotionId,
          storePromotionId,
          discount,
          deliveryFees,
          paymentMethod,
          totalPrice,
          totalProduct,
        } = order;

        const journeyLog = [
          { status: "order_created", updated_date: new Date() },
        ];

        // Tạo đơn hàng mới
        const newOrder = new Order({
          storeId,
          userId,
          name,
          phone,
          address,
          city,
          district,
          ward,
          longitude,
          latitude,
          estimatedDate,
          products,
          promotionId,
          storePromotionId,
          ghnOrderCode: null,
          discount,
          deliveryFees,
          paymentMethod,
          totalPrice,
          totalProduct,
          status: "Pending", // Chờ xác nhận
          shippingStatus: null, // Chưa gửi GHN
          journeyLog,
          isRating: false,
        });

        const savedOrder = await newOrder.save({ session });
        createdOrders.push(savedOrder);

        // Trừ tồn kho
        for (const item of products) {
          await Product.updateOne(
            { _id: item.productId, "variants.sku": item.variant.sku },
            { $inc: { "variants.$.quantity": -item.quantity } },
            { session }
          );
        }

        // Cập nhật khuyến mãi (nếu có)
        if (promotionId) {
          await Promotion.updateOne(
            { _id: promotionId },
            { $inc: { usageLimit: 1, remainingUses: -1 } },
            { session }
          );
        }

        if (storePromotionId) {
          await StorePromotion.updateOne(
            { _id: storePromotionId },
            { $inc: { usageLimit: 1, remainingUses: -1 } },
            { session }
          );
        }
      }

      await session.commitTransaction();
      session.endSession();

      res.status(200).json(createdOrders);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ message: error.message });
    }
  },

  createProductFromCart: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const orders = req.body; // 'orders' là danh sách các đơn hàng theo từng cửa hàng

      if (!orders || orders.length === 0) {
        return res.status(400).json({ message: "No orders provided" });
      }

      const createdOrders = [];

      for (const order of orders) {
        const {
          storeId,
          userId,
          name,
          phone,
          address,
          city,
          district,
          ward,
          longitude,
          latitude,
          estimatedDate,
          products,
          promotionId,
          storePromotionId,
          discount,
          deliveryFees,
          paymentMethod,
          totalPrice,
          totalProduct,
        } = order;

        const journeyLog = [
          { status: "order_created", updated_date: new Date() },
        ];

        // Tạo đơn hàng mới
        const newOrder = new Order({
          storeId,
          userId,
          name,
          phone,
          address,
          city,
          district,
          ward,
          longitude,
          latitude,
          estimatedDate,
          products,
          promotionId,
          storePromotionId,
          ghnOrderCode: null,
          discount,
          deliveryFees,
          paymentMethod,
          totalPrice,
          totalProduct,
          status: "Pending", // Chờ xác nhận
          shippingStatus: null, // Chưa gửi GHN
          journeyLog,
          isRating: false,
        });

        const savedOrder = await newOrder.save({ session });
        createdOrders.push(savedOrder);

        // Trừ tồn kho
        for (const item of products) {
          await Product.updateOne(
            { _id: item.productId, "variants._id": item.variant._id },
            { $inc: { "variants.$.quantity": -item.quantity } },
            { session }
          );
        }
        // Xóa sản phẩm khỏi giỏ hàng
        for (const item of products) {
          await Cart.updateOne(
            { userId },
            {
              $pull: {
                products: {
                  productId: item.productId,
                  variantId: item.variant._id,
                },
              },
            },
            { session }
          );
        }
        // Cập nhật khuyến mãi (nếu có)
        if (promotionId) {
          await Promotion.updateOne(
            { _id: promotionId },
            { $inc: { usageLimit: 1, remainingUses: -1 } },
            { session }
          );
        }
        if (storePromotionId) {
          await StorePromotion.updateOne(
            { _id: storePromotionId },
            { $inc: { quantityAvailable: -1 } },
            { session }
          );
        }
      }

      await session.commitTransaction();
      session.endSession();

      res.status(200).json(createdOrders);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ message: error.message });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate({
        path: "storeId",
        select: "name image provinceName", // Chỉ lấy 3 trường cần thiết
      });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getOrdersByUserId: async (req, res) => {
    try {
      const orders = await Order.find({ userId: req.params.userId });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getOrdersByUserIdAndStatus: async (req, res) => {
    try {
      const orders = await Order.find({
        userId: req.params.userId,
        status: req.params.status,
      })
        .sort({ createdAt: -1 }) // Sort orders by creation date, newest first
        .lean();

      const ordersWithShopDetails = await Promise.all(
        orders.map(async (order) => {
          const store = await Store.findById(order.storeId);
          if (store) {
            order.nameStore = store.name;
            order.avatar = store.image;
            order.provinceName = store.provinceName;
          } else {
            // Handle case where user is not found
            order.name = "Unknown";
            order.avatar = ""; // Provide a default image if necessary
          }
          return order;
        })
      );

      res.json(ordersWithShopDetails);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getOrderByStoreIdAndStatus: async (req, res) => {
    try {
      const orders = await Order.find({
        storeId: req.params.storeId,
        status: req.params.status,
      }).lean();
      const ordersWithShopDetails = await Promise.all(
        orders.map(async (order) => {
          const store = await Store.findById(order.storeId);
          if (store) {
            order.nameStore = store.name;
            order.avatar = store.image;
            order.provinceName = store.provinceName;
          } else {
            // Handle case where user is not found
            order.name = "Unknown";
            order.avatar = ""; // Provide a default image if necessary
          }
          return order;
        })
      );

      res.json(ordersWithShopDetails);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateOrderById: async (req, res) => {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  updateOrderStatus: async (req, res) => {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  deleteOrderById: async (req, res) => {
    try {
      const deletedOrder = await Order.findByIdAndDelete(req.params.id);
      if (!deletedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json({ message: "Order deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getOrderByStatus: async (req, res) => {
    try {
      const orders = await Order.find({ status: req.params.status }).lean();

      const ordersWithUserDetails = await Promise.all(
        orders.map(async (order) => {
          const store = await Store.findById(order.storeId);
          if (store) {
            order.nameStore = store.name;
            order.avatar = store.image;
            order.provinceName = store.provinceName;
          } else {
            // Handle case where user is not found
            order.name = "Unknown";
            order.avatar = ""; // Provide a default image if necessary
          }
        })
      );

      res.json(ordersWithUserDetails);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  checkDeliveredProduct: async (req, res) => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "userId and productId are required" });
    }

    try {
      const order = await Order.findOne({
        userId: userId,
        status: "Delivered",
        "products.productId": productId,
      });

      if (order) {
        return res
          .status(200)
          .json({
            message: "User has purchased this product and it is delivered",
            delivered: true,
          });
      } else {
        return res
          .status(200)
          .json({
            message:
              "User has not purchased this product or it is not delivered",
            delivered: false,
          });
      }
    } catch (error) {
      console.error("Error checking delivered status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  updateOrderRatingStatus: async (req, res) => {
    try {
      const { orderId } = req.params;

      // Kiểm tra ID hợp lệ
      if (!orderId) {
        return res.status(400).json({ message: "Thiếu orderId" });
      }

      // Tìm và cập nhật
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { isRating: true },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      return res.status(200).json({
        message: "Cập nhật trạng thái đánh giá thành công",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật đánh giá:", error);
      return res.status(500).json({ message: "Đã xảy ra lỗi máy chủ", error });
    }
  },
  getOrderDetailById : async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
        return res.status(400).json({
            success: false,
            message: 'Order ID is required'
        });
        }

        const order = await Order.findById(orderId).populate({
            path: 'storeId',
            select: 'name address latitude longitude provinceName districtName wardName'
        });

        if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
        }

        const responseData = {
            success: true,
            data: {
                order: {
                _id: order._id,
                userId: order.userId,
                name: order.name,
                phone: order.phone,
                address: order.address,
                city: order.city,
                district: order.district,
                ward: order.ward,
                longitude: order.longitude,
                latitude: order.latitude,
                estimatedDate: order.estimatedDate,
                products: order.products,
                discount: order.discount,
                deliveryFees: order.deliveryFees,
                paymentMethod: order.paymentMethod,
                totalPrice: order.totalPrice,
                totalProduct: order.totalProduct,
                status: order.status,
                shippingStatus: order.shippingStatus,
                journeyLog: order.journeyLog,
                isRating: order.isRating,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
                },
                store: order.storeId
            }
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
        });
    }
},
    getOrderDetailByShop: async (req, res) => {
      try {
          const { orderId } = req.params;
          const parameter = await Parameter.findOne();
          const commissionFee = parameter?.commissonFee || 0.05;

          if (!orderId) {
          return res.status(400).json({
              success: false,
              message: 'Order ID is required'
          });
          }

          const order = await Order.findById(orderId);

          const platformFees = order.totalPrice * commissionFee;

          let productCategoryFees = 0;

          for (const item of order.products) {
            const product = await Product.findById(item.productId);
            if (!product) continue;

            const category = await Category.findById(product.categoryId);
            if (!category) continue;

            const subCategory = await SubCategory.findById(category.subCategoryId);

            const categoryFeeRate = subCategory?.commissionFee/100 || 0.07; // default 7% nếu không có

            productCategoryFees += item.price * categoryFeeRate;
            }

          let storePromotionDiscount = 0;
          if(order.storePromotionId){
             const storePromotion = await StorePromotion.findById(order.storePromotionId);
             if(storePromotion){
                storePromotionDiscount = storePromotion.discount;
             }
          }

          if (!order) {
          return res.status(404).json({
              success: false,
              message: 'Order not found'
          });
          }
          const shopRevenue = order.totalProduct - platformFees - productCategoryFees - storePromotionDiscount;

          const responseData = {
            success: true,
            data: {
                order: {
                _id: order._id,
                userId: order.userId,
                name: order.name,
                phone: order.phone,
                address: order.address,
                city: order.city,
                district: order.district,
                ward: order.ward,
                longitude: order.longitude,
                latitude: order.latitude,
                estimatedDate: order.estimatedDate,
                products: order.products,
                discount: order.discount,
                deliveryFees: order.deliveryFees,
                paymentMethod: order.paymentMethod,
                totalPrice: order.totalPrice,
                totalProduct: order.totalProduct,
                status: order.status,
                shippingStatus: order.shippingStatus,
                journeyLog: order.journeyLog,
                isRating: order.isRating,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
                },
                financial: {
                    storePromotionDiscount,
                    platformFees: Math.round(platformFees),
                    productCategoryFees: Math.round(productCategoryFees),
                    shopRevenue: Math.round(shopRevenue)
                }
            }
          };

          res.status(200).json(responseData);

      } catch (error) {
          console.error('Error fetching order:', error);
          res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
          });
      }
      },

      getOrderDetailByAdmin: async (req, res) => {
      try {
          const { orderId } = req.params;
          const parameter = await Parameter.findOne();
          const commissionFee = parameter?.commissonFee || 0.05;

          if (!orderId) {
          return res.status(400).json({
              success: false,
              message: 'Order ID is required'
          });
          }

          const order = await Order.findById(orderId);

          const platformFees = order.totalPrice * commissionFee;

          let productCategoryFees = 0;

          for (const item of order.products) {
            const product = await Product.findById(item.productId);
            if (!product) continue;

            const category = await Category.findById(product.categoryId);
            if (!category) continue;

            const subCategory = await SubCategory.findById(category.subCategoryId);
            
            const categoryFeeRate = subCategory?.commissionFee/100 || 0.07; // default 7% nếu không có

            productCategoryFees += item.price * categoryFeeRate;
            }

          let adminPromotionDiscount = order.discount;
          if(order.storePromotionId){
             const storePromotion = await StorePromotion.findById(order.storePromotionId);
             if(storePromotion){
                adminPromotionDiscount -= storePromotion.discount;
             }
          }

          if (!order) {
          return res.status(404).json({
              success: false,
              message: 'Order not found'
          });
          }
          const adminRevenue = platformFees + productCategoryFees - adminPromotionDiscount;

          const responseData = {
            success: true,
            data: {
                order: {
                _id: order._id,
                userId: order.userId,
                name: order.name,
                phone: order.phone,
                address: order.address,
                city: order.city,
                district: order.district,
                ward: order.ward,
                longitude: order.longitude,
                latitude: order.latitude,
                estimatedDate: order.estimatedDate,
                products: order.products,
                discount: order.discount,
                deliveryFees: order.deliveryFees,
                paymentMethod: order.paymentMethod,
                totalPrice: order.totalPrice,
                totalProduct: order.totalProduct,
                status: order.status,
                shippingStatus: order.shippingStatus,
                journeyLog: order.journeyLog,
                isRating: order.isRating,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
                },
                financial: {
                    adminPromotionDiscount,
                    platformFees: Math.round(platformFees),
                    productCategoryFees: Math.round(productCategoryFees),
                    adminRevenue: Math.round(adminRevenue)
                }
            }
          };

          res.status(200).json(responseData);

      } catch (error) {
          console.error('Error fetching order:', error);
          res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
          });
      }
      },

};

module.exports = orderController;
