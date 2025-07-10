const vnpay_config = {
    vnp_TmnCode: process.env.VNP_TMN_CODE || 'YOUR_TMN_CODE',
    vnp_HashSecret: process.env.VNP_HASH_SECRET || 'YOUR_HASH_SECRET',
    vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:3000/api/vnpay/return',
    vnp_IpnUrl: process.env.VNP_IPN_URL || 'http://localhost:3000/api/vnpay/ipn'
};

module.exports = vnpay_config;