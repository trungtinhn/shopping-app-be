const { Agenda } = require('@hokify/agenda');
const { moderateImage } = require('./sightengineService');
const Product = require('../models/Product');
const dotenv = require("dotenv")

dotenv.config();
const connectString = process.env.MONGODB_URL.replace('<password>', process.env.MONGODB_PASSWORD);
const agenda = new Agenda({
  db: { address: connectString, collection: 'jobs' },
});

// Định nghĩa job kiểm duyệt ảnh sản phẩm
agenda.define('moderate product images', async job => {
  const { productId } = job.attrs.data;

  const product = await Product.findById(productId);
  if (!product) return;

  const allImageUrls = [
    ...product.productImages,
    ...product.variants.map(v => v.image).filter(Boolean)
  ];

  const results = await Promise.all(allImageUrls.map(url => moderateImage(url)));

  const unsafeLabels = results
    .filter(r => r.status === 'unsafe')
    .flatMap(r => r.labels);

  product.imageModerationStatus = unsafeLabels.length > 0 ? 'unsafe' : 'safe';

  if (unsafeLabels.length > 0) {
    product.imageModerationNote = `Sản phẩm có hình ảnh không phù hợp: ${[...new Set(unsafeLabels)].join(', ')}`;
  } else {
    product.imageModerationNote = 'Hình ảnh sản phẩm an toàn';
  }

  await product.save();
});

(async function () {
  await agenda.start();
})();

module.exports = agenda;