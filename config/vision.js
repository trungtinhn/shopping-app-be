const path = require('path');
const vision = require('@google-cloud/vision');

// Tạo đường dẫn tuyệt đối đến file JSON
const keyPath = path.resolve(__dirname, '..', 'visionApi.json');

const client = new vision.ImageAnnotatorClient({
  keyFilename: keyPath,
});

module.exports = client;
