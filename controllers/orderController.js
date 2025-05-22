const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order'); // Adjust the path as needed
const Product = require('../models/Product'); // Adjust the path as needed
const Cart = require('../models/Cart'); // Adjust the path as needed
const Promotion = require('../models/Promotion');
const User = require('../models/User');
const Store = require('../models/Store');
const StorePromotion = require('../models/StorePromotion');
const orderController = {
    createOrders: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            const orders  = req.body; // 'orders' là danh sách các đơn hàng theo từng cửa hàng

            if (!orders || orders.length === 0) {
                return res.status(400).json({ message: 'No orders provided' });
            }
    
            const createdOrders = [];
    
            for (const order of orders) {
                const { storeId, userId, name, phone, address, products, promotionId, storePromotionId, discount, deliveryFees, paymentMethod, totalPrice, totalProduct } = order;
    
                // Tạo đơn hàng mới
                const newOrder = new Order({
                    storeId,
                    userId,
                    name,
                    phone,
                    address,
                    products,
                    promotionId,
                    storePromotionId,
                    discount,
                    deliveryFees,
                    paymentMethod,
                    totalPrice,
                    totalProduct,
                });
    
                const savedOrder = await newOrder.save({ session });
                createdOrders.push(savedOrder);
    
                // Cập nhật số lượng sản phẩm trong kho
                for (const item of products) {
                    await Product.updateOne(
                        { _id: item.productId, 'Type.size': item.size, 'Type.color': item.color },
                        { $inc: { 'Type.$.quantity': -item.quantity } },
                        { session }
                    );
                }
    
                // Xóa sản phẩm khỏi giỏ hàng
                for (const item of products) {
                    await Cart.updateOne(
                        { userId },
                        { $pull: { products: { productId: item.productId, size: item.size, color: item.color } } },
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
    getAllOrders : async (req, res) => {
        try {
            const orders = await Order.find();
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getOrderById : async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.json(order);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getOrdersByUserId : async (req, res) => {
        try {
            const orders = await Order.find({ userId: req.params.userId });
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getOrdersByUserIdAndStatus : async (req, res) => {
        try {
            const orders = await Order.find({ userId: req.params.userId, status: req.params.status })
                                      .sort({ createdAt: -1 }) // Sort orders by creation date, newest first
                                      .lean();

            console.log(orders);

            const ordersWithShopDetails = await Promise.all(orders.map(async (order) => {
                const store = await Store.findById(order.storeId);
                if (store) {
                    order.nameStore = store.name;
                    order.avatar = store.image;
                } else {
                    // Handle case where user is not found
                    order.name = 'Unknown';
                    order.avatar = ''; // Provide a default image if necessary
                }
                return order;
            }));

            res.json(ordersWithShopDetails);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getOrderByStoreIdAndStatus: async (req, res) => {
        try {
            const orders = await Order.find({ storeId: req.params.storeId, status: req.params.status }).lean();
            const ordersWithShopDetails = await Promise.all(orders.map(async (order) => {
                const store = await Store.findById(order.storeId);
                if (store) {
                    order.name = store.name;
                    order.avatar = store.avatar;
                } else {
                    // Handle case where user is not found
                    order.name = 'Unknown';
                    order.avatar = ''; // Provide a default image if necessary
                }
                return order;
            }));


            res.json(ordersWithShopDetails);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    updateOrderById : async (req, res) => {
        try {
            const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!updatedOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.json(updatedOrder);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    updateOrderStatus : async (req, res) => {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
    
        try {
            const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
            if (!updatedOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.json(updatedOrder);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    deleteOrderById : async (req, res) => {
        try {
            const deletedOrder = await Order.findByIdAndDelete(req.params.id);
            if (!deletedOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.json({ message: 'Order deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getOrderByStatus: async (req, res) => {
        try {
            const orders = await Order.find({ status: req.params.status }).lean();

            const ordersWithUserDetails = await Promise.all(orders.map(async (order) => {
                const user = await User.findOne({ userId: order.userId });
                if (user) {
                    order.TenND = user.TenND;
                    order.Avatar = user.Avatar;
                } else {
                    // Handle case where user is not found
                    order.TenND = 'Unknown';
                    order.Avatar = ''; // Provide a default image if necessary
                }
                return order;
            }));

            res.json(ordersWithUserDetails);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    checkDeliveredProduct: async (req, res) => {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: 'userId and productId are required' });
        }

        try {
            const order = await Order.findOne({
                userId: userId,
                status: 'Delivered',
                'products.productId': productId
            });

            if (order) {
                return res.status(200).json({ message: 'User has purchased this product and it is delivered', delivered: true });
            } else {
                return res.status(200).json({ message: 'User has not purchased this product or it is not delivered', delivered: false });
            }
        } catch (error) {
            console.error('Error checking delivered status:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = orderController