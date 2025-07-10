const mongoose = require('mongoose');
const natural = require('natural');
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

// Thuộc tính kỹ thuật mô tả (không tạo variant)
const GeneralAttributeSchema = new mongoose.Schema({
  name: { type: String, required: true },      // Ví dụ: "RAM", "Màn hình"
  value: { type: String, required: true }      // Ví dụ: "8GB", "OLED 6.5 inch"
});

// Thuộc tính để phân loại sản phẩm (ví dụ: color, size)
const VariantAttributeSchema = new mongoose.Schema({
  name: { type: String, required: true },       // Ví dụ: "Color", "Size"
  values: [{ type: String, required: true }]    // ["Red", "Blue", "Green"]
});

// Biến thể cụ thể của sản phẩm
const VariantSchema = new mongoose.Schema({
  attributes: [
    {
      name: { type: String, required: true },   // Ví dụ: "Color"
      value: { type: String, required: true }   // Ví dụ: "Red"
    }
  ],
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  sku: { type: String },                        // Mã định danh riêng của biến thể "TSHIRT-BLACK-XL"
  image: { type: String }                       // Ảnh riêng nếu có
});

const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  basePrice: { type: Number, required: true, min: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },

  productImages: { type: [String], required: true }, // ảnh chính

  // Thuộc tính kỹ thuật mô tả
  generalAttributes: [GeneralAttributeSchema],

  // Các thuộc tính phân loại (Color, Size,...)
  variantAttributes: [VariantAttributeSchema],

  // Danh sách các biến thể (1 biến thể = 1 tổ hợp thuộc tính)
  variants: [VariantSchema],

  description: { type: String, default: 'Không có mô tả' },
  isOnSale: { type: Boolean, default: true },
  discountPrice: { type: Number, default: 0, min: 0 },

  // Thống kê
  reviewCount: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  soldQuantity: { type: Number, default: 0, min: 0 },
  viewCount: { type: Number, default: 0, min: 0 },
  wishlistCount: { type: Number, default: 0, min: 0 },

  weight: { type: Number, default: 0 }, // đơn vị: gram
  height: { type: Number, default: 0 }, // đơn vị: cm
  length: { type: Number, default: 0 }, // đơn vị: cm
  width:  { type: Number, default: 0 }, // đơn vị: cm

  status: {
    type: String,
    enum: ['available', 'outofstock', 'onwait', 'rejected', 'hide'],
    default: 'available'
  },
  imageModerationStatus: {
    type: String,
    enum: ['safe', 'unsafe', 'unchecked'],
    default: 'unchecked',
  },
  imageModerationNote: {
    type: String,
    default: '',
  },

}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);


// Tạo các đặc trưng từ giá gốc, giá giảm và tên sản phẩm
ProductSchema.virtual('features').get(function() {
    const priceFeature = this.originalPrice;
    const discountPriceFeature = this.discountPrice;
    
    // Tạo mảng các giá trị TF-IDF
    const tfidfValues = [];
    tfidf.addDocument(this.productName);
    tfidf.tfidfs(this.productName, function(i, measure) {
        tfidfValues.push(measure);
    });

    // Chuyển đổi tfidfValues thành mảng 1 chiều
    const flattenedTfidfValues = [].concat(...tfidfValues);

    return [priceFeature, discountPriceFeature, ...flattenedTfidfValues];
  });



module.exports = mongoose.model('Product', ProductSchema);
