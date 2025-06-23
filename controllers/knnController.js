const Like = require('../models/Like');
const distance = require('euclidean-distance');
const Order = require('../models/Order');
const Product = require('../models/Product');
const k = 6;
const knnRecommend = {
    knnRecommendLike: async (req, res) => {
        try {
            const { userId } = req.params; // Sửa lỗi cú pháp
            //console.log(userId);
            const userLikes = await Like.findOne({ userId: userId }).populate('productList');
            //console.log(userLikes);
        
            if (!userLikes || !userLikes.productList.length) {
              return res.status(404).json({ message: 'Không tìm thấy sản phẩm nào trong danh sách yêu thích của người dùng này' });
            }
        
            // Tập hợp tất cả các sản phẩm mà người dùng đã thích
            const likedProducts = userLikes.productList;
        
            // Tìm tất cả các sản phẩm chưa thích
            const allProducts = await Product.find();
            const notLikedProducts = allProducts.filter(product =>
              !likedProducts.some(p => p._id.equals(product._id))
            );
        
            // Tính khoảng cách giữa các sản phẩm chưa thích và các sản phẩm đã thích
            const distances = notLikedProducts.map(product => {
              const minDistance = Math.min(
                ...likedProducts.map(likedProduct =>
                  distance(product.features, likedProduct.features)
                )
              );
              return {
                product,
                distance: minDistance,
              };
            });
        
            // Sắp xếp sản phẩm theo khoảng cách tăng dần
            distances.sort((a, b) => a.distance - b.distance);
        
            // Lấy k sản phẩm gần nhất
            const recommendedProducts = distances.slice(0, k).map(d => d.product);
        
            // Trả về kết quả gợi ý
            return res.status(200).json(recommendedProducts);
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình gợi ý sản phẩm' });
          }
    },
    knnRecommendSell: async (req, res) => {
      try{
        const { userId } = req.params; // Sửa lỗi cụ pháp
        const orders = await Order.find({ userId }).populate('products.productId');
        if (!orders.length) throw new Error('Không tìm thấy đơn hàng nào cho người dùng này');

        // Tập hợp tất cả các sản phẩm đã mua của người dùng
        const purchasedProducts = orders.flatMap(order => order.products.map(p => p.productId));
 
        // Tìm tất cả các sản phẩm chưa mua
        const allProducts = await Product.find();
        const notPurchasedProducts = allProducts.filter(product =>
          !purchasedProducts.some(p => p._id.equals(product._id))
        );

        const distances = notPurchasedProducts.map(product => {
          const minDistance = Math.min(
            ...purchasedProducts.map(purchasedProduct =>
              distance(product.features, purchasedProduct.features)
            )
          );
          return {
            product,
            distance: minDistance,
          };
        });
        distances.sort((a, b) => a.distance - b.distance);
        const recommendedProducts = distances.slice(0, k).map(d => d.product);

        return res.status(200).json(recommendedProducts);
      }catch(error){
        console.error(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình gợi ý sản phẩm' });
      }
    },
    knnRecommendSearch: async (req, res) => {

    }
}
module.exports = knnRecommend