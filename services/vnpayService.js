const qs = require('qs');
const moment = require('moment');
const vnpayConfig = require('../config/vnpay.config');
const VNPayHelper = require('../helpers/vnpayHelper');

class VNPayService {
    constructor() {
        this.config = vnpayConfig;
    }

    createPaymentUrl({ amount, orderInfo, ipAddr, orderId = null }) {
        try {
            const createDate = moment().format('YYYYMMDDHHmmss');
            const orderIdGenerated = orderId || VNPayHelper.generateOrderId();

            let vnp_Params = {
                'vnp_Version': '2.1.0',
                'vnp_Command': 'pay',
                'vnp_TmnCode': this.config.vnp_TmnCode,
                'vnp_Locale': 'vn',
                'vnp_CurrCode': 'VND',
                'vnp_TxnRef': orderIdGenerated,
                'vnp_OrderInfo': orderInfo,
                'vnp_OrderType': 'other',
                'vnp_Amount': amount * 100, // VNPay yêu cầu amount * 100
                'vnp_ReturnUrl': this.config.vnp_ReturnUrl,
                'vnp_IpAddr': ipAddr,
                'vnp_CreateDate': createDate
            };
            //vnp_Params['vnp_BankCode'] = 'VNBANK';

            // Tạo secure hash
            const secureHash = VNPayHelper.createSecureHash(vnp_Params, this.config.vnp_HashSecret);
            vnp_Params['vnp_SecureHash'] = secureHash;

            // Tạo URL
            const paymentUrl = this.config.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

            return {
                success: true,
                paymentUrl,
                orderId: orderIdGenerated
            };
        } catch (error) {
            return {
                success: false,
                message: 'Lỗi tạo URL thanh toán',
                error: error.message
            };
        }
    }

    verifyReturnUrl(vnp_Params) {
        try {
            const isValidHash = VNPayHelper.validateSecureHash({ ...vnp_Params }, this.config.vnp_HashSecret);
            
            if (!isValidHash) {
                return {
                    success: false,
                    message: 'Chữ ký không hợp lệ'
                };
            }

            const orderId = vnp_Params['vnp_TxnRef'];
            const responseCode = vnp_Params['vnp_ResponseCode'];
            const transactionId = vnp_Params['vnp_TransactionNo'];
            const amount = vnp_Params['vnp_Amount'];

            if (responseCode === '00') {
                return {
                    success: true,
                    message: 'Thanh toán thành công',
                    data: {
                        orderId,
                        transactionId,
                        amount: parseInt(amount) / 100,
                        responseCode
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Thanh toán thất bại',
                    data: {
                        orderId,
                        responseCode
                    }
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Lỗi xử lý kết quả thanh toán',
                error: error.message
            };
        }
    }

    processIPN(vnp_Params) {
        try {
            const isValidHash = VNPayHelper.validateSecureHash({ ...vnp_Params }, this.config.vnp_HashSecret);
            
            if (!isValidHash) {
                return { RspCode: '97', Message: 'Checksum failed' };
            }

            const orderId = vnp_Params['vnp_TxnRef'];
            const responseCode = vnp_Params['vnp_ResponseCode'];
            const amount = vnp_Params['vnp_Amount'];
            const transactionId = vnp_Params['vnp_TransactionNo'];

            // TODO: Kiểm tra orderId có tồn tại trong database
            const checkOrderId = this.checkOrderExists(orderId);
            if (!checkOrderId) {
                return { RspCode: '01', Message: 'Order not found' };
            }

            // TODO: Kiểm tra số tiền có khớp với database
            const checkAmount = this.validateAmount(orderId, amount);
            if (!checkAmount) {
                return { RspCode: '04', Message: 'Amount invalid' };
            }

            // TODO: Kiểm tra trạng thái thanh toán hiện tại
            const currentStatus = this.getPaymentStatus(orderId);
            if (currentStatus !== '0') { // 0: chưa thanh toán
                return { RspCode: '02', Message: 'This order has been updated to the payment status' };
            }

            // Cập nhật trạng thái thanh toán
            if (responseCode === '00') {
                // Thanh toán thành công
                this.updatePaymentStatus(orderId, '1', transactionId); // 1: thành công
            } else {
                // Thanh toán thất bại
                this.updatePaymentStatus(orderId, '2', transactionId); // 2: thất bại
            }

            return { RspCode: '00', Message: 'Success' };
        } catch (error) {
            console.error('VNPay IPN Error:', error);
            return { RspCode: '99', Message: 'System error' };
        }
    }

    // TODO: Implement các method để tương tác với database
    checkOrderExists(orderId) {
        // Kiểm tra orderId có tồn tại trong database
        // Trả về true/false
        return true; // Mock data
    }

    validateAmount(orderId, amount) {
        // Kiểm tra số tiền có khớp với database
        // Trả về true/false
        return true; // Mock data
    }

    getPaymentStatus(orderId) {
        // Lấy trạng thái thanh toán hiện tại từ database
        // Trả về: '0' (chưa thanh toán), '1' (thành công), '2' (thất bại)
        return '0'; // Mock data
    }

    updatePaymentStatus(orderId, status, transactionId) {
        // Cập nhật trạng thái thanh toán trong database
        console.log(`Updating order ${orderId} status to ${status}, transaction: ${transactionId}`);
        // TODO: Implement database update
    }

    getOrderDetails(orderId) {
        // Lấy thông tin chi tiết đơn hàng từ database
        return {
            orderId,
            status: 'pending', // pending, success, failed
            amount: 100000,
            createdAt: new Date(),
            transactionId: null
        };
    }
}

module.exports = VNPayService;