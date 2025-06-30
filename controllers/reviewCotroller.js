const Review = require("../models/Review");
const Product = require("../models/Product");
const reviewController = {
  // Thêm mới đánh giá
  addReview: async (req, res) => {
    try {
      const { rating, productId } = req.body;

      // 1. Tạo review mới
      const newReview = new Review(req.body);
      await newReview.save();

      // 2. Tính lại trung bình rating và số lượng review
      const reviews = await Review.find({ productId });

      const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
      const reviewCount = reviews.length;
      const averageRating = Math.round((totalRatings / reviewCount) * 10) / 10; // Làm tròn 1 chữ số thập phân

      // 3. Cập nhật lại product
      await Product.findByIdAndUpdate(productId, {
        rating: averageRating,
        reviewCount: reviewCount,
      });

      // 4. Trả về kết quả
      res.status(200).json({ message: "Created new review successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create new review!", error });
    }
  },

  // Cập nhật đánh giá
  updateReview: async (req, res) => {
    try {
      const updatedReview = await Review.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found!" });
      }
      res.status(200).json(updatedReview);
    } catch (error) {
      res.status(500).json({ message: "Failed to update review!", error });
    }
  },

  // Xóa đánh giá
  deleteReview: async (req, res) => {
    try {
      const deletedReview = await Review.findByIdAndDelete(req.params.id);
      if (!deletedReview) {
        return res.status(404).json({ message: "Review not found!" });
      }
      res.status(200).json({ message: "Deleted review successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete review!", error });
    }
  },

  // Lấy tất cả đánh giá
  getAllReviews: async (req, res) => {
    try {
      const reviews = await Review.find()
        .populate("userId", "fullName avatar")
        .populate("productId", "productName basePrice")
        .populate('storeId', 'name') // Nếu có Store model
        .lean();;
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reviews!", error });
    }
  },

  // Lấy đánh giá theo sản phẩm
  getReviewsByProductId: async (req, res) => {
    try {
      const reviews = await Review.find({ productId: req.params.productId })
        .populate("userId", "fullName avatar")
        .lean();

      if (reviews.length === 0) {
        return res
          .status(404)
          .json({ message: "No reviews found for this product!" });
      }

      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reviews!", error });
    }
  },

  // Lấy đánh giá chi tiết theo ID
  getReviewById: async (req, res) => {
    try {
      const review = await Review.findById(req.params.id)
        .populate("userId", "fullName avatar")
        .populate("productId", "name");

      if (!review) {
        return res.status(404).json({ message: "Review not found!" });
      }

      res.status(200).json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to get review!", error });
    }
  },
};

module.exports = reviewController;
