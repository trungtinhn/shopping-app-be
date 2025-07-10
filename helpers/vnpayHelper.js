const crypto = require('crypto');
const qs = require('qs');
const moment = require('moment');

class VNPayHelper {
    static sortObject(obj) {
        let sorted = {};
        let str = [];
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }

    static createSecureHash(params, secretKey) {
        const sortedParams = this.sortObject(params);
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        return hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    }

    static generateOrderId() {
        return moment().format('DDHHmmss') + Math.floor(Math.random() * 1000);
    }

    static getClientIp(req) {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);
    }

    static validateSecureHash(params, secretKey) {
        const secureHash = params['vnp_SecureHash'];
        delete params['vnp_SecureHash'];
        delete params['vnp_SecureHashType'];
        
        const calculatedHash = this.createSecureHash(params, secretKey);
        return secureHash === calculatedHash;
    }
}

module.exports = VNPayHelper;