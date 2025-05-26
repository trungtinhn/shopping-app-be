const ShippingStatus = require('../models/ShippingStatus');

// Create
exports.createShippingStatus = async (req, res) => {
    try {
        const { status, description } = req.body;
        const existing = await ShippingStatus.findOne({ status });
        if (existing) return res.status(400).json({ message: 'Status already exists' });

        const newStatus = new ShippingStatus({ status, description });
        await newStatus.save();
        res.json(newStatus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all
exports.getAllShippingStatuses = async (req, res) => {
    try {
        const statuses = await ShippingStatus.find();
        res.json(statuses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get by ID
exports.getShippingStatusById = async (req, res) => {
    try {
        const status = await ShippingStatus.findById(req.params.id);
        if (!status) return res.status(404).json({ message: 'Status not found' });
        res.json(status);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update
exports.updateShippingStatus = async (req, res) => {
    try {
        const { status, description } = req.body;
        const updated = await ShippingStatus.findByIdAndUpdate(
            req.params.id,
            { status, description },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Status not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete
exports.deleteShippingStatus = async (req, res) => {
    try {
        const deleted = await ShippingStatus.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Status not found' });
        res.json({ message: 'Status deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
