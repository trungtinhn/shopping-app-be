const geminiService = require('../services/geminiService');

const geminiController = {
    async generateFromImage(req, res, next) {
        try {
            // Kiểm tra file upload
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Không có file ảnh được upload'
                });
            }

            // Gọi service để tạo keywords
            const keywords = await geminiService.generateKeywords(
                req.file.buffer, 
                req.file.mimetype
            );

            // Trả về kết quả
            res.json({
                success: true,
                keywords: keywords,
                total: keywords.length,
                fileInfo: {
                    originalName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    size: req.file.size
                }
            });

        } catch (error) {
            next(error);
        }
    },

    async generateFromUrl(req, res, next) {
        try {
            const { imageUrl } = req.body;

            if (!imageUrl) {
                return res.status(400).json({
                    success: false,
                    error: 'Thiếu imageUrl trong request body'
                });
            }

            // Tải ảnh từ URL
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error('Không thể tải ảnh từ URL');
            }

            const imageBuffer = Buffer.from(await response.arrayBuffer());
            const mimeType = response.headers.get('content-type') || 'image/jpeg';

            // Tạo keywords
            const keywords = await geminiService.generateKeywords(imageBuffer, mimeType);

            res.json({
                success: true,
                keywords: keywords,
                total: keywords.length,
                source: 'url',
                imageUrl: imageUrl
            });

        } catch (error) {
            next(error);
        }
    },

    // Health check endpoint
    async healthCheck(req, res) {
        res.json({
            success: true,
            service: 'Product Keywords API',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    }
};

module.exports = geminiController;