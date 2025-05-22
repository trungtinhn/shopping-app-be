const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  commissionFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  globalCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GlobalCategory',
    required: true,
  }
}, {
  timestamps: true,
});

const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;
