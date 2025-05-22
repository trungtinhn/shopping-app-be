const Store = require('../models/Store');
const addressService = require('../services/addressService');
const ghnService = require('../services/ghnServices');
const storeController = {
    addStore: async (req, res) => {
        try {
            const {
                name,
                address,
                phoneNumber,
                email,
                description,
                image,
                status,
                ownerId,
                latitude,
                longitude,
                provinceName,
                districtName,
                wardName,
              } = req.body;
            const addressIds = await addressService.resolveFullAddress({ provinceName, districtName, wardName });

            const newStore = new Store({
                name,
                address,
                phoneNumber,
                email,
                description,
                image,
                status,
                ownerId,
                latitude,
                longitude,
                ...addressIds, // spread dữ liệu từ service
              });

            await newStore.save();
            res.status(201).json({ message: 'Store created successfully', store: newStore });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAllStores: async (req, res) => {
        try {
            const stores = await Store.find();
            res.status(200).json(stores);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getStoreById: async (req, res) => {
        try {
            const store = await Store.findById(req.params.id);
            if (!store) {
                return res.status(404).json({ error: 'Store not found' });
            }
            res.status(200).json(store);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateStore: async (req, res) => {
        try {
            const updatedStore = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedStore) {
                return res.status(404).json({ error: 'Store not found' });
            }
            res.status(200).json({ message: 'Store updated successfully', store: updatedStore });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    approveStore: async (req, res) => {
        try {
          const store = await Store.findById(req.params.id);
          if (!store) return res.status(404).json({ message: 'Store not found' });
    
          if (store.status === 'active') {
            return res.status(400).json({ message: 'Store is already approved' });
          }
    
          const ghnResponse = await ghnService.registerGHNShop(store);
          if (ghnResponse.code !== 200 || !ghnResponse.data?.shop_id) {
            return res.status(400).json({ message: 'GHN registration failed', ghnResponse });
          }
    
          store.ghnShopId = ghnResponse.data.shop_id;
          store.status = 'active';
          await store.save();
    
          res.status(200).json({ message: 'Store approved and registered with GHN', store });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    },

    deleteStore: async (req, res) => {
        try {
            const deletedStore = await Store.findByIdAndDelete(req.params.id);
            if (!deletedStore) {
                return res.status(404).json({ error: 'Store not found' });
            }
            res.status(200).json({ message: 'Store deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = storeController;
