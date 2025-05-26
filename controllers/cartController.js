const Cart = require('../models/Cart');

const cartController = {
  // Thêm sản phẩm vào giỏ hàng
  addProductToCart: async (req, res) => {
    try {
      const {
        userId,
        productId,
        variantId,
        storeId,
        name,
        image,
        attributes,
        quantity,
        price,
      } = req.body;

      const totalPrice = price * quantity;

      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({
          userId,
          products: [{
            productId,
            variantId,
            storeId,
            name,
            image,
            attributes,
            quantity,
            price,
            totalPrice,
          }],
        });
      } else {
        const existingProductIndex = cart.products.findIndex(
          (product) => product.variantId.toString() === variantId
        );

        if (existingProductIndex !== -1) {
          // Nếu đã có, cộng dồn số lượng và cập nhật totalPrice
          cart.products[existingProductIndex].quantity += quantity;
          cart.products[existingProductIndex].totalPrice =
            cart.products[existingProductIndex].quantity *
            cart.products[existingProductIndex].price;
        } else {
          cart.products.push({
            productId,
            variantId,
            storeId,
            name,
            image,
            attributes,
            quantity,
            price,
            totalPrice,
          });
        }
      }

      await cart.save();
      res.status(200).json({ success: true, cart });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  },

  // Cập nhật thông tin sản phẩm trong giỏ hàng
  updateProductInCart: async (req, res) => {
    try {
      const { userId, variantId, quantity, price } = req.body;
      const totalPrice = price * quantity;

      let cart = await Cart.findOne({ userId });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const productIndex = cart.products.findIndex(
        (product) => product.variantId.toString() === variantId
      );

      if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found in cart' });
      }

      cart.products[productIndex].quantity = quantity;
      cart.products[productIndex].price = price;
      cart.products[productIndex].totalPrice = totalPrice;

      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update product in cart!', error });
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeProductFromCart: async (req, res) => {
    try {
      const { userId, variantId } = req.body;

      let cart = await Cart.findOne({ userId });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const productIndex = cart.products.findIndex(
        (product) => product.variantId.toString() === variantId
      );

      if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found in cart' });
      }

      cart.products.splice(productIndex, 1);

      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove product from cart!', error });
    }
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async (req, res) => {
    try {
      const { userId } = req.body;

      const cart = await Cart.findOneAndUpdate(
        { userId },
        { $set: { products: [] } },
        { new: true }
      );

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Failed to clear cart!', error });
    }
  },

  // Lấy thông tin giỏ hàng
  getCart: async (req, res) => {
    try {
      const { userId } = req.params;

      const cart = await Cart.findOne({ userId }).populate([
        {
          path: 'products.productId',
          select: 'name image price',
        },
        {
          path: 'products.storeId',
          select: 'name image',
        },
      ]);

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get cart!', error });
    }
  },
};

module.exports = cartController;
