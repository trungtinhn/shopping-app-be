const Category = require('../models/Category');

const categoryController = {
  // Thêm danh mục mới
  addCategory: async (req, res) => {
    try {
      const { description, name, image, numProduct, storeId, subCategoryId } = req.body;

      const newCategory = new Category({
        description,
        name,
        image,
        numProduct,
        storeId,
        subCategoryId,
      });

      const savedCategory = await newCategory.save();
      res.status(201).json(savedCategory);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create new category!', error: error.message });
    }
  },

  // Cập nhật danh mục
  updateCategory: async (req, res) => {
    try {
      const { description, name, image, numProduct, storeId, subCategoryId } = req.body;

      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            description,
            name,
            image,
            numProduct,
            storeId,
            subCategoryId
          }
        },
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found!' });
      }

      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update category!', error: error.message });
    }
  },

  // Xóa danh mục
  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);

      if (!category) {
        return res.status(404).json({ message: 'Category not found!' });
      }

      res.status(200).json({ message: 'Delete category successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete category!', error: error.message });
    }
  },

  // Lấy tất cả danh mục
  getCategory: async (req, res) => {
    try {
      const categories = await Category.find()
        .populate('storeId', 'name')
        .populate('subCategoryId', 'name');
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get categories!', error: error.message });
    }
  },

  // Lấy tất cả danh mục của một cửa hàng cụ thể
  getCategoriesByStore: async (req, res) => {
    try {
      const { storeId } = req.params;

      const categories = await Category.find({ storeId })
        .populate('subCategoryId', 'name');

      if (!categories.length) {
        return res.status(404).json({ message: 'No categories found for this store!' });
      }

      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get categories!', error: error.message });
    }
  },

  // Lấy tất cả danh mục theo subCategoryId
  getCategoriesBySubCategory: async (req, res) => {
    try {
      const { subCategoryId } = req.params;

      const categories = await Category.find({ subCategoryId })
        .populate('storeId', 'name');

      if (!categories.length) {
        return res.status(404).json({ message: 'No categories found for this subCategory!' });
      }

      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get categories!', error: error.message });
    }
  },

  // Cập nhật số lượng sản phẩm
  updateProductAmountInCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { productAmount } = req.body;

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { $set: { numProduct: productAmount } },
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found!' });
      }

      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update product amount!', error: error.message });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found!' });
      }
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get category!', error: error.message });
    }
  },
};

module.exports = categoryController;
