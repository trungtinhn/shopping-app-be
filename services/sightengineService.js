const axios = require('axios');

// Map nhãn sang tiếng Việt
const LABEL_TRANSLATIONS = {
  nudity: 'ảnh nhạy cảm (khoả thân)',
  weapon: 'vũ khí',
  drugs: 'chất cấm / ma túy',
  gore: 'hình ảnh máu me',
  offensive: 'hình ảnh phản cảm'
};

// Hàm kiểm duyệt hình ảnh
const moderateImage = async (url) => {
  try {
    const response = await axios.get('https://api.sightengine.com/1.0/check.json', {
      params: {
        url,
        models: 'nudity-2.1,weapon,recreational_drug,medical,gore-2.0,offensive-2.0',
        api_user: process.env.SIGHTENGINE_USER,
        api_secret: process.env.SIGHTENGINE_SECRET,
      }
    });

    const data = response.data;
    const labels = [];

    // Kiểm duyệt ảnh nhạy cảm
    if (data.nudity && (data.nudity.none ?? 1) < 0.85) {
      labels.push('nudity');
    }

    // Kiểm duyệt bạo lực (gore)
    if (data.gore && (data.gore.prob ?? 0) > 0.5) {
      labels.push('gore');
    }

    // Kiểm duyệt chất cấm (drugs)
    const drugProb = data.recreational_drug?.prob ?? 0;
    const medicalProb = data.medical?.prob ?? 0;
    if (Math.max(drugProb, medicalProb) > 0.5) {
      labels.push('drugs');
    }

    // Kiểm duyệt vũ khí
    const weaponProbs = Object.values(data.weapon?.classes || {});
    if (Math.max(...weaponProbs, 0) > 0.5) {
      labels.push('weapon');
    }

    // Kiểm duyệt xúc phạm
    const offensiveProbs = Object.values(data.offensive || {});
    if (Math.max(...offensiveProbs, 0) > 0.5) {
      labels.push('offensive');
    }

    const translatedLabels = labels.map(label => LABEL_TRANSLATIONS[label]);

    return {
      status: labels.length > 0 ? 'unsafe' : 'safe',
      translatedLabels
    };
  } catch (err) {
    console.error('Sightengine API error:', err.response?.data || err.message);
    return {
      status: 'unchecked',
      labels: [],
      translatedLabels: []
    };
  }
};

module.exports = { moderateImage };
