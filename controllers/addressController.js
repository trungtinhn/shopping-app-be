const Address = require('../models/Address');
const addressService = require('../services/addressService');

const addressController = {
    addAddress: async (req, res) => {
        try {
            const { address, userID, ward, district, phoneNumber, buyerName, city, latitude, longitude } = req.body;
            
            const addressIds = await addressService.resolveFullAddress({ provinceName: city, districtName: district, wardName: ward });

            const newAddress = new Address({
                address,
                userID,
                ward,
                district,
                phoneNumber,
                buyerName,
                city,
                latitude,
                longitude,
                provinceId: addressIds.provinceId,
                districtId: addressIds.districtId,
                wardCode: addressIds.wardCode
            });

            await newAddress.save();
            res.status(201).json({ message: 'Address created successfully!', address: newAddress });
        } catch (error) {
            res.status(500).json({ message: 'Failed to create address!', error: error.message });
        }
    },

    updateAddress: async (req, res) => {
        try {
            const updatedAddress = await Address.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true }
            );

            if (!updatedAddress) {
                return res.status(404).json({ message: 'Address not found!' });
            }

            res.status(200).json({ message: 'Address updated successfully!', address: updatedAddress });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update address!', error: error.message });
        }
    },

    deleteAddress: async (req, res) => {
        try {
            const deletedAddress = await Address.findByIdAndDelete(req.params.id);

            if (!deletedAddress) {
                return res.status(404).json({ message: 'Address not found!' });
            }

            res.status(200).json({ message: 'Address deleted successfully!' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete address!', error: error.message });
        }
    },

    getAllAddresses: async (req, res) => {
        try {
            const addresses = await Address.find();
            res.status(200).json(addresses);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve addresses!', error: error.message });
        }
    },

    getAddressById: async (req, res) => {
        try {
            const address = await Address.findById(req.params.id);

            if (!address) {
                return res.status(404).json({ message: 'Address not found!' });
            }

            res.status(200).json(address);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve address!', error: error.message });
        }
    },

    getAddressesByUserId: async (req, res) => {
        try {
            console.log(req.params.userId);
            const addresses = await Address.find({ userID: req.params.userId });

            if (addresses.length === 0) {
                return res.status(404).json({ message: 'No addresses found for this user!' });
            }

            res.status(200).json(addresses);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve addresses!', error: error.message });
        }
    },
};

module.exports = addressController;
