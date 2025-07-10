const geminiConfig = require('../config/gemini');
const keywordParser = require('../helpers/keywordParser');

const createPrompt = () => {
    return `
Hãy xem các sản phẩm có trong ảnh này và tạo ra danh sách từ khóa để tìm kiếm sản phẩm tương tự.

Yêu cầu:
- Trả về 8-10 từ khóa ngắn gọn và chính xác
- Bao gồm: loại sản phẩm, màu sắc, thương hiệu (nếu nhận diện được), đặc điểm nổi bật
- Từ khóa bằng tiếng Việt, dễ hiểu, phù hợp cho tìm kiếm
- Chỉ trả về danh sách từ khóa, mỗi từ khóa một dòng
- KHÔNG cần giải thích, mô tả hay văn bản khác

Ví dụ format mong muốn:
áo sơ mi nam
áo màu xanh navy
áo công sở
áo tay dài
áo cotton
`;
};

const handleGeminiError = (error) => {
    if (error.message.includes('quota')) {
        return new Error('Đã vượt quá giới hạn API quota');
    }
    
    if (error.message.includes('API key')) {
        return new Error('API key không hợp lệ');
    }
    
    if (error.message.includes('rate limit')) {
        return new Error('Gửi request quá nhanh, vui lòng thử lại sau');
    }
    
    return new Error('Lỗi xử lý ảnh với AI: ' + error.message);
};

const geminiService = {
    async generateKeywords(imageBuffer, mimetype) {
        try {
            const model = geminiConfig.getModel();

            // Convert image to base64
            const imageBase64 = imageBuffer.toString('base64');
            
            // Create prompt
            const prompt = createPrompt();
            
            // Prepare image part
            const imagePart = {
                inlineData: {
                    data: imageBase64,
                    mimeType: mimetype
                }
            };

            // Call Gemini API
            const result = await model.generateContent([prompt, imagePart]);
            const response = result.response.text();
            
            // Parse and validate keywords
            const rawKeywords = keywordParser.parseKeywords(response);
            const validKeywords = keywordParser.validateKeywords(rawKeywords);
            
            return validKeywords;
        } catch (error) {
            throw handleGeminiError(error);
        }
    }
};

module.exports = geminiService;