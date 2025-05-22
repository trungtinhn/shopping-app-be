const GlobalCategory = require('../models/GlobalCategory');

const globalCategoryController = {
    getAllCategories : async (req, res) => {
        try {
            const categories = await GlobalCategory.find();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi lấy danh mục', error });
        }
    },
    getCategoryById : async (req, res) => {
        try {
            const category = await GlobalCategory.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
            res.status(200).json(category);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi lấy danh mục', error });
        }
    },
    createCategory : async (req, res) => {
        try {
            const { name, image, description } = req.body;
            const newCategory = new GlobalCategory({ name, image, description });
            await newCategory.save();
            res.status(201).json(newCategory);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi tạo danh mục', error });
        }
    },
    updateCategory : async (req, res) => {
        try {
            const { name, image, description } = req.body;
            const updatedCategory = await GlobalCategory.findByIdAndUpdate(
                req.params.id,
                { name, image, description },
                { new: true, runValidators: true }
            );
            if (!updatedCategory) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục để cập nhật' });
            }
            res.status(200).json(updatedCategory);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi cập nhật danh mục', error });
        }
    },
    deleteCategory : async (req, res) => {
        try {
            const deletedCategory = await GlobalCategory.findByIdAndDelete(req.params.id);
            if (!deletedCategory) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục để xóa' });
            }
            res.status(200).json({ message: 'Xóa danh mục thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi xóa danh mục', error });
        }
    },

};

module.exports = globalCategoryController;