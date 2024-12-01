const AdApproval = require('../models/adApprovalModel');
const Item = require('../models/itemModel');

// Approve ad
const approveAd = async (req, res) => {
  const { adId } = req.params;

  try {
    const ad = await AdApproval.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }
    ad.status = 'approved';
    await ad.save();
    res.status(200).json({ message: 'Ad approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving ad', error });
  }
};

module.exports = {
  approveAd
};
