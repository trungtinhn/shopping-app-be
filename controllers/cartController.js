const Cart = require('../models/Cart');

const cartController = {
  // Thêm sản phẩm vào giỏ hàng
  addProductToCart: async (req, res) => {
    try {
      const {
        userId,
        productId,
        storeId,
        name,
        image,
        quantity,
        size,
        color,
        price,
      } = req.body;
      const totalPrice = price * quantity;

      // Tìm giỏ hàng theo userId
      let cart = await Cart.findOne({userId});

      if (!cart) {
        // Nếu chưa có giỏ hàng, tạo mới
        cart = new Cart({userId, products: []});
      }

      // Kiểm tra xem sản phẩm với cùng size và color đã có trong giỏ hàng chưa
      const productIndex = cart.products.findIndex(
        product =>
          product.productId.toString() === productId &&
          product.size === size &&
          product.color === color,
      );

      if (productIndex !== -1) {
        // Nếu đã có, cập nhật số lượng và tổng giá
        cart.products[productIndex].quantity += quantity;
        cart.products[productIndex].totalPrice += totalPrice;
      } else {
        // Nếu chưa có, thêm sản phẩm mới
        cart.products.push({
          productId,
          storeId,
          name,
          image,
          quantity,
          size,
          color,
          price,
          totalPrice,
        });
      }

      // Lưu giỏ hàng đã cập nhật
      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({message: 'Failed to add product to cart!', error});
    }
  },

  // Cập nhật thông tin sản phẩm trong giỏ hàng
  updateProductInCart: async (req, res) => {
    try {
      const {userId, productId, size, color, quantity, price} = req.body;
      const totalPrice = price * quantity;

      // Tìm giỏ hàng theo userId
      let cart = await Cart.findOne({userId});

      if (!cart) {
        return res.status(404).json({message: 'Cart not found'});
      }

      // Tìm sản phẩm cần cập nhật
      const productIndex = cart.products.findIndex(
        product =>
          product.productId.toString() === productId &&
          product.size === size &&
          product.color === color,
      );

      if (productIndex === -1) {
        return res.status(404).json({message: 'Product not found in cart'});
      }

      // Cập nhật thông tin sản phẩm
      cart.products[productIndex].quantity = quantity;
      cart.products[productIndex].price = price;
      cart.products[productIndex].totalPrice = totalPrice;

      // Lưu giỏ hàng đã cập nhật
      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      res
        .status(500)
        .json({message: 'Failed to update product in cart!', error});
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeProductFromCart: async (req, res) => {
    try {
      const {userId, productId, size, color} = req.body;

      // Tìm giỏ hàng theo userId
      let cart = await Cart.findOne({userId});

      if (!cart) {
        return res.status(404).json({message: 'Cart not found'});
      }

      // Tìm sản phẩm cần xóa
      const productIndex = cart.products.findIndex(
        product =>
          product.productId.toString() === productId &&
          product.size === size &&
          product.color === color,
      );

      if (productIndex === -1) {
        return res.status(404).json({message: 'Product not found in cart'});
      }

      // Xóa sản phẩm khỏi giỏ hàng
      cart.products.splice(productIndex, 1);

      // Lưu giỏ hàng đã cập nhật
      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      res
        .status(500)
        .json({message: 'Failed to remove product from cart!', error});
    }
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async (req, res) => {
    try {
      const {userId} = req.body;

      // Tìm giỏ hàng và xóa toàn bộ sản phẩm
      const cart = await Cart.findOneAndUpdate(
        {userId},
        {$set: {products: []}},
        {new: true},
      );

      if (!cart) {
        return res.status(404).json({message: 'Cart not found'});
      }

      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({message: 'Failed to clear cart!', error});
    }
  },

  // Lấy thông tin giỏ hàng
  // Lấy thông tin giỏ hàng
  getCart: async (req, res) => {
    try {
      const {userId} = req.params;

      // Tìm giỏ hàng theo userId, populate sản phẩm và thông tin cửa hàng
      const cart = await Cart.findOne({userId}).populate({
        path: 'products.productId',
        select: 'name image price size color quantity totalPrice', // Lấy thông tin sản phẩm và storeId
        populate: {
          path: 'storeId',
          select: 'name image', // Lấy thông tin tên và avatar của cửa hàng
        },
      });

      if (!cart) {
        return res.status(404).json({message: 'Cart not found'});
      }

      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({message: 'Failed to get cart!', error});
    }
  },
};

module.exports = cartController;
