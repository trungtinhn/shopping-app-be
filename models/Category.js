const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    name: {
        type: String,  
        required: true
    },
    image: {
        type: String,
        required: true
    },
    numProduct: {
        type: Number,
        default: 0,
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory' // Liên kết với danh mục toàn cục
    },
}, {timestamps: true})

module.exports = mongoose.model("Category", categorySchema)
