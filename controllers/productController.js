const Product = require("../models/Product");
const agenda = require("../services/agenda");
const productController = {
  addProduct: async (req, res) => {
    try {
      const newProduct = new Product(req.body);
      await newProduct.save();

      await agenda.now("moderate product images", {
        productId: newProduct._id,
      });

      res.status(200).json("Created new product successfully!");
    } catch (error) {
      res.status(500).json({ message: "Failed to create new product!", error });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product!", error });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.status(200).json("Deleted product successfully!");
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product!", error });
    }
  },

  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find().populate([{
          path: 'storeId',
          select: 'name image',
        }],);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products!", error });
    }
  },

  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id)
        .populate("categoryId")
        .populate("storeId");
      if (!product) {
        return res.status(404).json("Product not found!");
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product!", error });
    }
  },

  getProductTrending: async (req, res) => {
    try {
      const products = await Product.find({
        status: "available",
      });
      res.status(200).json(products);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get trending products!", error });
    }
  },

  getProductOnSale: async (req, res) => {
    try {
      const products = await Product.find({
        isOnSale: true,
        status: "available",
      });
      res.status(200).json(products);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get on-sale products!", error });
    }
  },

  getProductByCategory: async (req, res) => {
    try {
      const products = await Product.find({
        categoryId: req.params.categoryId,
        status: "available",
      });
      console.log("Products:", products);
      res.status(200).json(products);
    } catch (error) {
      console.error("Error:", error);
      res
        .status(500)
        .json({ message: "Failed to get products by category!", error });
    }
  },

  getProductBySubCategory: async (req, res) => {
    try {
      const subCategoryId = req.params.subCategoryId;
      const categories = await Category.find({ subCategoryId });
      const categoryIds = categories.map((cat) => cat._id);
      const products = await Product.find({
        categoryId: { $in: categoryIds },
        status: "available",
      });
      res.status(200).json(products);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get products by global category!", error });
    }
  },

  getProductAvailable: async (req, res) => {
    try {
      const products = await Product.find({ status: "available" });
      res.status(200).json(products);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get available products!", error });
    }
  },

  getProductsByStatus: async (req, res) => {
    try {
      const { status } = req.query; // Lấy trạng thái từ query parameter
      if (!status) {
        return res.status(400).json({ message: "Status is required!" });
      }

      const validStatuses = ["available", "onwait", "outofstock"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value!" });
      }

      const products = await Product.find({ status });
      if (!products || products.length === 0) {
        return res
          .status(404)
          .json({ message: `No products found with status: ${status}` });
      }

      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products!", error });
    }
  },

  getProductsByStoreId: async (req, res) => {
    try {
      console.log("req.params: ");
      const { storeId } = req.params; // Lấy storeId từ params
      console.log(storeId);
      if (!storeId) {
        return res.status(400).json({ message: "Store ID is required!" });
      }

      const products = await Product.find({ storeId });
      if (!products || products.length === 0) {
        return res
          .status(404)
          .json({ message: `No products found for store ID: ${storeId}` });
      }

      res.status(200).json(products);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get products by store ID!", error });
    }
  },

  getProductsByStatusAndStoreId: async (req, res) => {
    try {
      const { storeId, status } = req.params; // Lấy storeId và status từ body
      if (!storeId || !status) {
        return res
          .status(400)
          .json({ message: "Store ID and status are required!" });
      }

      const products = await Product.find({ storeId, status });
      if (!products || products.length === 0) {
        return res
          .status(404)
          .json({
            message: `No products found with status: ${status} for store ID: ${storeId}`,
          });
      }

      res.status(200).json(products);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Failed to get products by status and store ID!",
          error,
        });
    }
  },

  setProductStatus: async (req, res) => {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      );
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to set product status!", error });
    }
  },

  checkAvailability: async (req, res) => {
    try {
      const products = req.body; // Array of products to check

      const productAvailability = await Promise.all(
        products.map(async (item) => {
          const product = await Product.findById(item.productId);

          if (!product) {
            return {
              productId: item.productId,
              available: false,
              message: "Product not found",
            };
          }

          const color = product.colors.find((c) => c.name === item.color);
          if (!color) {
            return {
              productId: item.productId,
              available: false,
              message: "Color not found",
            };
          }

          const type = product.types.find(
            (t) => t.size === item.size && t.color === color.code
          );
          if (!type) {
            return {
              productId: item.productId,
              available: false,
              message: "Type not found",
            };
          }

          if (type.quantity >= item.quantity) {
            return {
              productId: item.productId,
              available: true,
              quantityAvailable: type.quantity,
            };
          } else {
            return {
              productId: item.productId,
              available: false,
              quantityAvailable: type.quantity,
            };
          }
        })
      );

      res.status(200).json(productAvailability);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to check product availability!", error });
    }
  },
  updateImageModerationStatus: async (req, res) => {
    try {
      const { productId } = req.params;
      const { imageModerationStatus, imageModerationNote = "" } = req.body;

      // Validate required fields
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      if (!imageModerationStatus) {
        return res.status(400).json({
          success: false,
          message: "Image moderation status is required",
        });
      }

      // Validate moderation status values based on your model
      const validStatuses = ["safe", "unsafe", "unchecked"];
      if (!validStatuses.includes(imageModerationStatus)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid moderation status. Must be one of: safe, unsafe, unchecked",
        });
      }

      // Find the product by ID
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Update the image moderation fields according to your model
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          imageModerationStatus,
          imageModerationNote,
        },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        success: true,
        message: "Image moderation status updated successfully",
        data: {
          productId: updatedProduct._id,
          imageModerationStatus: updatedProduct.imageModerationStatus,
          imageModerationNote: updatedProduct.imageModerationNote,
          updatedAt: updatedProduct.updatedAt, // Using timestamps from your model
        },
      });
    } catch (error) {
      console.error("Error updating image moderation status:", error);

      // Handle specific database errors
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }

      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID format",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};

module.exports = productController;
