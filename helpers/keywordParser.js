const keywordParser = {
    parseKeywords(text) {
        // Tách theo dòng và làm sạch
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .filter(line => !line.startsWith('#')) // Bỏ tiêu đề
            .filter(line => !line.includes(':')) // Bỏ giải thích
            .map(line => line.replace(/^[-•*]\s*/, '')) // Bỏ bullet points
            .map(line => line.replace(/^\d+\.\s*/, '')) // Bỏ số thứ tự
            .filter(line => line.length > 2) // Bỏ từ quá ngắn
            .slice(0, 10); // Giới hạn 10 keywords

        return lines;
    },

    validateKeywords(keywords) {
        return keywords.filter(keyword => 
            keyword && 
            typeof keyword === 'string' && 
            keyword.trim().length > 0
        );
    },

    formatKeywords(keywords) {
        return keywords.map(keyword => 
            keyword.toLowerCase().trim()
        );
    }
};

module.exports = keywordParser;