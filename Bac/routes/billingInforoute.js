const express = require('express');
const router = express.Router();
const Billing = require('../models/billingModel');
const authMiddleware = require("../middlewares/authMiddleware")
// Create billing info
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { metamask, residenceAddress } = req.body;
        const newBilling = new Billing({
            user: req.user._id,
            metamask,
            residenceAddress
        });
        await newBilling.save();
        res.status(201).json({ message: 'Billing information created successfully', billing: newBilling });
    } catch (error) {
        res.status(500).json({ message: 'Error creating billing information', error: error.message });
    }
});

// Get billing info
router.get('/', authMiddleware, async (req, res) => {
    try {
        const billing = await Billing.findOne({ user: req.user._id });
        if (!billing) {
            return res.status(404).json({ message: 'Billing information not found' });
        }
        res.status(200).json(billing);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching billing information', error: error.message });
    }
});

// Edit billing info
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { metamask, residenceAddress } = req.body;
        const updatedBilling = await Billing.findOneAndUpdate(
            { user: req.user._id },
            { metamask, residenceAddress },
            { new: true, runValidators: true }
        );
        if (!updatedBilling) {
            return res.status(404).json({ message: 'Billing information not found' });
        }
        res.status(200).json({ message: 'Billing information updated successfully', billing: updatedBilling });
    } catch (error) {
        res.status(500).json({ message: 'Error updating billing information', error: error.message });
    }
});

// Delete billing info
router.delete('/', authMiddleware, async (req, res) => {
    try {
        const deletedBilling = await Billing.findOneAndDelete({ user: req.user._id });
        if (!deletedBilling) {
            return res.status(404).json({ message: 'Billing information not found' });
        }
        res.status(200).json({ message: 'Billing information deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting billing information', error: error.message });
    }
});

module.exports = router;
