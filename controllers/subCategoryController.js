const SubCategory = require('../models/SubCategory');

const subCategoryController = {
    // ➕ Tạo mới SubCategory
    create: async (req, res) => {
        try {
        const { name, description, image, commissionFee, globalCategoryId } = req.body;

        if (!name || !globalCategoryId) {
            return res.status(400).json({ message: 'Name and globalCategoryId are required' });
        }

        const newSubCategory = new SubCategory({
            name,
            description,
            image,
            commissionFee,
            globalCategoryId,
        });

        const saved = await newSubCategory.save();
        return res.status(201).json(saved);
        } catch (error) {
        return res.status(500).json({ message: 'Error creating subcategory', error });
        }
    },

    // 📋 Lấy danh sách tất cả SubCategories
    getAll: async (req, res) => {
        try {
        const list = await SubCategory.find().populate('globalCategoryId', 'name');
        return res.status(200).json(list);
        } catch (error) {
        return res.status(500).json({ message: 'Error fetching subcategories', error });
        }
    },

    // 🔍 Lấy 1 SubCategory theo ID
    getById: async (req, res) => {
        try {
        const { id } = req.params;
        const sub = await SubCategory.findById(id).populate('globalCategoryId', 'name');
        if (!sub) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }
        return res.status(200).json(sub);
        } catch (error) {
        return res.status(500).json({ message: 'Error fetching subcategory', error });
        }
    },

    // 📂 Lấy danh sách SubCategory theo globalCategoryId
    getByGlobalCategoryId: async (req, res) => {
        try {
            const { globalCategoryId } = req.params;
            const list = await SubCategory.find({ globalCategoryId }).populate('globalCategoryId', 'name');

            return res.status(200).json(list);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching subcategories by globalCategoryId', error });
        }
    },


    // ✏️ Cập nhật SubCategory
    update: async (req, res) => {
        try {
        const { id } = req.params;
        const updated = await SubCategory.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updated) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        return res.status(200).json(updated);
        } catch (error) {
        return res.status(500).json({ message: 'Error updating subcategory', error });
        }
    },

    // 🗑️ Xoá SubCategory
    delete: async (req, res) => {
        try {
        const { id } = req.params;
        const deleted = await SubCategory.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }
        return res.status(200).json({ message: 'SubCategory deleted successfully' });
        } catch (error) {
        return res.status(500).json({ message: 'Error deleting subcategory', error });
        }
    },
};

module.exports = subCategoryController;
