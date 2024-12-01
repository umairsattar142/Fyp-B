const Feedback = require('../models/feedbackModel');
const Item = require('../models/itemModel');

// Get all feedbacks for an item
exports.getAllFeedbacks = async (req, res) => {
    try {
        const { id } = req.params; // Item ID
        const feedbacks = await Feedback.find({ itemId: id }).populate('userId');
        console.log(feedbacks,"feedback")
        if (!feedbacks) {
            return res.status(404).json({ message: 'No feedbacks found for this item' });
        }

        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feedbacks', error: error.message });
    }
};

// Post a feedback for an item
exports.postFeedback = async (req, res) => {
    try {
        const { id } = req.params; // Item ID
        const { comment } = req.body;
        const userId = req.user.id; // Assuming user ID is attached to req.user by authMiddleware
        console.log(comment)
        // Check if the item exists
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Create new feedback
        const newFeedback = new Feedback({
            userId,
            itemId: id,
            message:comment
        });

        await newFeedback.save();

        res.status(201).json({ message: 'Feedback posted successfully', feedback: newFeedback });
    } catch (error) {
        res.status(500).json({ message: 'Error posting feedback', error: error.message });
    }
};
