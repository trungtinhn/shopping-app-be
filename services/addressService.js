const axios = require('axios');

const GHN_API = process.env.GHN_API_BASE_URL;
const GHN_TOKEN = process.env.GHN_API_KEY;

const headers = {
  Token: GHN_TOKEN,
};

const addressService = {
  async resolveFullAddress({ provinceName, districtName, wardName }) {
    try {
      // 1. Province
      const provinces = await axios.get(`${GHN_API}/master-data/province`, { headers });
      const province = provinces.data.data.find(p =>
        p.ProvinceName.toLowerCase().includes(provinceName.toLowerCase())
      );
      if (!province) throw new Error('Province not found');

      // 2. District
      const districts = await axios.post(`${GHN_API}/master-data/district`, {
        province_id: province.ProvinceID,
      }, { headers });
      const district = districts.data.data.find(d =>
        d.DistrictName.toLowerCase().includes(districtName.toLowerCase())
      );
      if (!district) throw new Error('District not found');

      // 3. Ward
      const wards = await axios.post(`${GHN_API}/master-data/ward`, {
        district_id: district.DistrictID,
      }, { headers });
      const ward = wards.data.data.find(w =>
        w.WardName.toLowerCase().includes(wardName.toLowerCase())
      );
      if (!ward) throw new Error('Ward not found');

      return {
        provinceId: province.ProvinceID,
        provinceName: province.ProvinceName,
        districtId: district.DistrictID,
        districtName: district.DistrictName,
        wardCode: ward.WardCode,
        wardName: ward.WardName,
      };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = addressService;
