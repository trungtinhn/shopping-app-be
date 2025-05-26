const mongoose = require('mongoose');
const cron = require('node-cron');
const axios = require('axios');

// Model Order
const Order = require('../models/Order');
const GHN_API_BASE_URL = process.env.GHN_API_BASE_URL;
const GHN_TOKEN = process.env.GHN_API_KEY;

// Hàm lấy trạng thái đơn hàng từ GHN
const getGHNOrderStatus = async (ghnOrderCode) => {
    try {
        const response = await axios.post(
            `${GHN_API_BASE_URL}/v2/shipping-order/detail`,
            { order_code: ghnOrderCode },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Token': GHN_TOKEN
                }
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

// Hàm cập nhật trạng thái và ghi log hành trình
const updateOrderStatusesGHN = async () => {
    try {
        const orders = await Order.find({
            status: { $in: ['Pending', 'WaitingPickup', 'Shipping'] },
            ghnOrderCode: { $exists: true, $ne: null }
        });

        console.log(`Tìm thấy ${orders.length} đơn hàng chưa hoàn thành.`);

        for (const order of orders) {
            const ghnData = await getGHNOrderStatus(order.ghnOrderCode);
            if (ghnData) {
                const { status, shippingStatus } = mapGHNStatusToInternal(ghnData.status);
                // Lấy tất cả log từ GHN và chuyển thành định dạng journeyLog
                const ghnLogs = ghnData.log || [];
                console.log(ghnLogs);

                // Lấy danh sách trạng thái và ngày cập nhật hiện tại trong journeyLog
                const existingLogs = order.journeyLog || [];
                console.log(existingLogs);
                const existingLogKeys = existingLogs.map(log => `${log.status}|${log.updated_date.toISOString()}`);

                // Lọc các log mới (chưa tồn tại trong journeyLog)
                const newLogs = ghnLogs
                    .filter(log => !existingLogKeys.includes(`${log.status}|${log.updated_date}`))
                    .map(log => ({
                        status: log.status,
                        updated_date: new Date(log.updated_date)
                    }));
                // Cập nhật trạng thái và thêm tất cả log mới (nếu có)
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
            }
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error.message);
    }
};

// Lập lịch chạy mỗi 5 phút
cron.schedule('*/15 * * * *', () => {
    console.log('Bắt đầu kiểm tra trạng thái đơn hàng GHN...');
    updateOrderStatusesGHN();
});

module.exports = { updateOrderStatusesGHN };
