const VNPayService = require('../services/vnpayService');
const VNPayHelper = require('../helpers/vnpayHelper');

class VNPayController {
    constructor() {
        this.vnpayService = new VNPayService();
    }

    createPaymentUrl = async (req, res) => {
        try {
            const { amount, orderInfo, orderId } = req.body;

            // Validation
            if (!amount || !orderInfo) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: amount, orderInfo'
                });
            }

            if (amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Số tiền phải lớn hơn 0'
                });
            }

            const ipAddr = VNPayHelper.getClientIp(req);
            
            const result = this.vnpayService.createPaymentUrl({
                amount: parseInt(amount),
                orderInfo,
                ipAddr,
                orderId
            });

            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Create payment URL error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống',
                error: error.message
            });
        }
    }

    handleReturn = async (req, res) => {
        try {
            const vnp_Params = req.query;
            console.log(vnp_Params);    
            const result = this.vnpayService.verifyReturnUrl(vnp_Params);

            console.log(result);
            
            res.json(result);
        } catch (error) {
            console.error('Handle return error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi xử lý kết quả thanh toán',
                error: error.message
            });
        }
    }

    handleIPN = async (req, res) => {
        try {
            const vnp_Params = req.query;
            const result = this.vnpayService.processIPN(vnp_Params);
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Handle IPN error:', error);
            res.status(500).json({
                RspCode: '99',
                Message: 'System error'
            });
        }
    }

    getPaymentStatus = async (req, res) => {
        try {
            const { orderId } = req.params;
            
            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: 'OrderId là bắt buộc'
                });
            }

            const orderDetails = this.vnpayService.getOrderDetails(orderId);
            
            res.json({
                success: true,
                data: orderDetails
            });
        } catch (error) {
            console.error('Get payment status error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi lấy trạng thái thanh toán',
                error: error.message
            });
        }
    }
}

module.exports = VNPayController;