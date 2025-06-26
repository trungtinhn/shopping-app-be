const mongoose = require('mongoose');
const cron = require('node-cron');
const axios = require('axios');

// Model Order
const Order = require('../models/Order');
const Product = require('../models/Product');

// Câu hình
const GHN_API_URL = process.env.GHN_API_BASE_URL;
const GHN_API_BASE_URL = process.env.GHN_API_BASE_URL;
const GHN_TOKEN = process.env.GHN_API_KEY;

// Biến để theo dõi trạng thái chạy
let isRunning = false;
let lastRunTime = null;

// Hàm lấy trạng thái đơn hàng từ GHN với timeout
const getGHNOrderStatus = async (ghnOrderCode) => {
    try {
        const response = await axios.post(
            `${GHN_API_BASE_URL}/v2/shipping-order/detail`,
            { order_code: ghnOrderCode },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Token': GHN_TOKEN
                },
                timeout: 10000 // Timeout 10 giây
            }
        );
        return response.data.data;
    } catch (error) {
        console.error(`Lỗi khi lấy trạng thái đơn hàng ${ghnOrderCode}:`, error.message);
        return null;
    }
};

// Ánh xạ trạng thái GHN sang trạng thái nội bộ
const mapGHNStatusToInternal = (ghnStatus) => {
    switch (ghnStatus) {
        case 'ready_to_pick':
            return { status: 'WaitingPickup', shippingStatus: 'ready_to_pick' };
        case 'picking':
            return { status: 'WaitingPickup', shippingStatus: 'picking' };
        case 'picked':
            return { status: 'Shipping', shippingStatus: 'picked' };
        case 'delivering':
            return { status: 'Shipping', shippingStatus: 'delivering' };
        case 'delivered':
            return { status: 'Completed', shippingStatus: 'delivered' };
        case 'returned':
            return { status: 'Returned', shippingStatus: 'returned' };
        case 'cancel':
            return { status: 'Cancelled', shippingStatus: 'cancel' };
        default:
            return { status: 'Pending', shippingStatus: ghnStatus };
    }
};

// Hàm xử lý từng đơn hàng với giới hạn thời gian
const processOrder = async (order) => {
    try {
        const ghnData = await getGHNOrderStatus(order.ghnOrderCode);
        if (ghnData) {
            const { status, shippingStatus } = mapGHNStatusToInternal(ghnData.status);
            
            const ghnLogs = ghnData.log || [];
            const existingLogs = order.journeyLog || [];

            const createLogKey = (status, dateStr) => {
                const date = new Date(dateStr);
                return `${status}|${date.toISOString()}`;
            };

            const existingLogKeys = existingLogs.map(log =>
                createLogKey(log.status, log.updated_date)
            );

            const newLogs = ghnLogs
                .filter(log => {
                    const logKey = createLogKey(log.status, log.updated_date);
                    return !existingLogKeys.includes(logKey);
                })
                .map(log => ({
                    status: log.status,
                    updated_date: new Date(log.updated_date)
                }));

            // Cập nhật đơn hàng
            await Order.updateOne(
                { _id: order._id },
                {
                    $set: {
                        status,
                        shippingStatus,
                        updatedAt: new Date()
                    },
                    $push: {
                        journeyLog: { $each: newLogs }
                    }
                }
            );

            // ✅ Nếu đơn hàng mới chuyển sang "Completed" thì cập nhật soldQuantity
            if (status === "Completed" && order.status !== "Completed") {
                for (const product of order.products) {
                    await Product.updateOne(
                        { _id: product.productId },
                        { $inc: { soldQuantity: product.quantity } }
                    );
                }
            }
        }
    } catch (error) {
        console.error(`Lỗi khi xử lý đơn hàng ${order._id}:`, error.message);
    }
};

// Hàm xử lý batch với giới hạn số lượng
const processBatch = async (orders, batchSize = 5) => {
    for (let i = 0; i < orders.length; i += batchSize) {
        const batch = orders.slice(i, i + batchSize);
        
        // Xử lý song song trong batch với Promise.allSettled
        const promises = batch.map(order => processOrder(order));
        await Promise.allSettled(promises);
        
        // Nghỉ ngắn giữa các batch để tránh overload
        if (i + batchSize < orders.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
};

// Hàm cập nhật trạng thái với cải thiện performance
const updateOrderStatusesGHN = async () => {
    // Kiểm tra xem có đang chạy không
    if (isRunning) {
        console.log('Tác vụ cập nhật đang chạy, bỏ qua lần này...');
        return;
    }

    const startTime = Date.now();
    isRunning = true;

    try {
        console.log('Bắt đầu kiểm tra trạng thái đơn hàng GHN...');
        
        // Lấy đơn hàng với limit để tránh xử lý quá nhiều
        const orders = await Order.find({
            status: { $in: ['Pending', 'WaitingPickup', 'Shipping'] },
            ghnOrderCode: { $exists: true, $ne: null }
        }).limit(50); // Giới hạn 50 đơn hàng mỗi lần

        console.log(`Tìm thấy ${orders.length} đơn hàng chưa hoàn thành.`);

        if (orders.length > 0) {
            // Xử lý theo batch
            await processBatch(orders, 5);
        }

        const duration = Date.now() - startTime;
        lastRunTime = new Date();
        console.log(`Hoàn thành cập nhật trạng thái trong ${duration}ms`);

    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error.message);
    } finally {
        isRunning = false;
    }
};

// Wrapper function để chạy async trong cron
const runCronJob = () => {
    updateOrderStatusesGHN().catch(error => {
        console.error('Lỗi không mong đợi trong cron job:', error);
        isRunning = false; // Reset trạng thái nếu có lỗi
    });
};

// Lập lịch chạy mỗi 15 phút với scheduled: false để tránh overlap
const task = cron.schedule('*/15 * * * *', runCronJob, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Đang dừng cron job...');
    task.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Đang dừng cron job...');
    task.stop();
    process.exit(0);
});

module.exports = { 
    updateOrderStatusesGHN 
};