const axios = require('axios');
const Like = require('../models/Like');
const Order = require('../models/Order');
const Product = require('../models/Product');

// URL của Python recommendation service
const PYTHON_SERVICE_URL = 'http://localhost:5000/api'; // Thay đổi theo port của Flask app

const knnRecommend = {
    // Gọi Python service cho recommendation dựa trên Like
    knnRecommendLike: async (req, res) => {
        try {
            const { userId } = req.params;
            
            // Gọi Python service
            const response = await axios.post(`${PYTHON_SERVICE_URL}/recommend`, {
                user_id: userId,
                n_recommendations: 6
            }, {
                timeout: 30000, // 30 seconds timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const recommendedProductIds = response.data.recommended_ids;
            
            if (!recommendedProductIds || !recommendedProductIds.length) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy sản phẩm gợi ý nào cho người dùng này' 
                });
            }
            
            // Lấy thông tin chi tiết của các sản phẩm được gợi ý
            const recommendedProducts = await Product.find({
                '_id': { $in: recommendedProductIds }
            });
            
            return res.status(200).json({
                success: true,
                count: recommendedProducts.length,
                recommendations: recommendedProducts
            });
            
        } catch (error) {
            console.error('Lỗi khi gọi Python recommendation service:', error.message);
            
            // Fallback: Sử dụng logic cũ nếu Python service không hoạt động
            //return await this.fallbackRecommendLike(req, res);
        }
    },

    knnRecommendSimilar: async (req, res) => {
        try {
            const { productId } = req.params;
            console.log(productId);
            
            // Gọi Python service
            const response = await axios.post(`${PYTHON_SERVICE_URL}/similar`, {
                product_id: productId,
                n_similar: 6
            }, {
                timeout: 30000, // 30 seconds timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const recommendedProductIds = response.data.similar_ids;
            
            if (!recommendedProductIds || !recommendedProductIds.length) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy sản phẩm gợi ý nào cho người dùng này' 
                });
            }
            
            // Lấy thông tin chi tiết của các sản phẩm được gợi ý
            const recommendedProducts = await Product.find({
                '_id': { $in: recommendedProductIds }
            });
            
            return res.status(200).json({
                success: true,
                count: recommendedProducts.length,
                recommendations: recommendedProducts
            });
            
        } catch (error) {
            console.error('Lỗi khi gọi Python recommendation service:', error.message);
            
            // Fallback: Sử dụng logic cũ nếu Python service không hoạt động
            //return await this.fallbackRecommendLike(req, res);
        }
    },

    
    // // Fallback method sử dụng logic cũ
    // fallbackRecommendLike: async (req, res) => {
    //     try {
    //         const { userId } = req.params;
    //         const userLikes = await Like.findOne({ userId: userId }).populate('productList');
            
    //         if (!userLikes || !userLikes.productList.length) {
    //             // Trả về sản phẩm phổ biến nhất
    //             const popularProducts = await Product.find()
    //                 .sort({ soldQuantity: -1, rating: -1 })
    //                 .limit(6);
                
    //             return res.status(200).json({
    //                 success: true,
    //                 count: popularProducts.length,
    //                 recommendations: popularProducts,
    //                 message: 'Hiển thị sản phẩm phổ biến do chưa có dữ liệu yêu thích'
    //             });
    //         }
            
    //         // Logic cũ của bạn ở đây...
    //         const likedProducts = userLikes.productList;
    //         const allProducts = await Product.find();
    //         const notLikedProducts = allProducts.filter(product =>
    //             !likedProducts.some(p => p._id.equals(product._id))
    //         );
            
    //         // Simplified recommendation (có thể cải thiện)
    //         const recommendedProducts = notLikedProducts
    //             .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    //             .slice(0, 6);
            
    //         return res.status(200).json({
    //             success: true,
    //             count: recommendedProducts.length,
    //             recommendations: recommendedProducts
    //         });
            
    //     } catch (error) {
    //         console.error('Lỗi fallback recommendation:', error);
    //         return res.status(500).json({ 
    //             success: false,
    //             message: 'Đã xảy ra lỗi trong quá trình gợi ý sản phẩm' 
    //         });
    //     }
    // },
    
    // Recommendation dựa trên lịch sử mua hàng
    knnRecommendSell: async (req, res) => {
        try {
            const { userId } = req.params;
            
            // Kiểm tra xem user có lịch sử mua hàng không
            const orders = await Order.find({ userId }).populate('products.productId');
            
            if (!orders.length) {
                // Nếu chưa có lịch sử mua hàng, gọi recommend dựa trên like
                return await this.knnRecommendLike(req, res);
            }
            
            // Có thể mở rộng để gọi Python service với loại recommendation khác
            // Hiện tại sử dụng cùng logic như like
            return await this.knnRecommendLike(req, res);
            
        } catch (error) {
            console.error('Lỗi recommend dựa trên lịch sử mua:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Đã xảy ra lỗi trong quá trình gợi ý sản phẩm' 
            });
        }
    },
    
    // Recommendation dựa trên search/browse history
    knnRecommendSearch: async (req, res) => {
        try {
            const { userId, query } = req.params;
            
            // Implement search-based recommendation logic
            // Có thể gọi Python service với query parameters
            
            return res.status(200).json({
                success: true,
                message: 'Search-based recommendation chưa được implement'
            });
            
        } catch (error) {
            console.error('Lỗi search recommendation:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Đã xảy ra lỗi trong quá trình gợi ý sản phẩm' 
            });
        }
    },
    
    // Health check cho Python service
    checkPythonService: async (req, res) => {
        try {
            const response = await axios.get(`${PYTHON_SERVICE_URL}/health`, {
                timeout: 5000
            });
            
            return res.status(200).json({
                success: true,
                pythonService: 'healthy',
                data: response.data
            });
            
        } catch (error) {
            return res.status(503).json({
                success: false,
                pythonService: 'unhealthy',
                error: error.message
            });
        }
    }
};

module.exports = knnRecommend;