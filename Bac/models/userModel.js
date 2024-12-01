const mongoose = require('mongoose');
const { DEFAULT_PROFILE } = require('../utils/constants');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cnic: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  profileImage: { type: String ,default :DEFAULT_PROFILE}, // URL or path to profile image
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  contact:{type:String,required:true,default:"03143052185"},
  ratings: [{
    ratingValue: { type: Number },
    feedback: { type: String },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
