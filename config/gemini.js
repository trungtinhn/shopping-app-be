const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY không được tìm thấy trong .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const geminiConfig = {
    getModel() {
        return model;
    }
};

module.exports = geminiConfig;