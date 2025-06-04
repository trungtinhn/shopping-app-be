const axios = require("axios");
const GHN_API_URL = process.env.GHN_API_BASE_URL;
const GHN_TOKEN = process.env.GHN_API_KEY;

async function registerGHNShop(store) {
    const body = {
        name: store.name,
        phone: store.phoneNumber,
        address: store.address + ", " + store.wardName + ", " + store.districtName + ", " + store.provinceName,
        district_id: store.districtId, // bạn cần lưu thêm trường này khi tạo store
        ward_code: store.wardCode      // và trường này nữa
    };

    const response = await axios.post(`${GHN_API_URL}/v2/shop/register`, body, {
        headers: {
            Token: GHN_TOKEN
        }
    });
    
    return response.data;
}



module.exports = { registerGHNShop };
