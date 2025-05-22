const vision = require('@google-cloud/vision');

// Khởi tạo client
const client = new vision.ImageAnnotatorClient({
  keyFilename: '../visionApi.json', // Đường dẫn đến file JSON
});

module.exports = client;
