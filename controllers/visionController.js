const visionClient = require('../services/vision');

const visionController = {
    analyzeImage : async (req, res) => {
        try {
          console.log(req.file.buffer);
          const fileBuffer = req.file.buffer;
      
          // Gửi ảnh đến Vision API
          const [result] = await visionClient.labelDetection({
            image: { content: fileBuffer.toString('base64') },
          });
      
          const labels = result.labelAnnotations.map((label) => label.description);
          res.json({ labels });
        } catch (error) {
          console.error(error);
          res.status(500).send('Error processing the image');
        }
      }
}

module.exports = visionController