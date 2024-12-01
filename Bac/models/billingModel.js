const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		unique: true
	},
	metamask: {
		type: String,
		required: true,
		unique: true,
		validate: {
			validator: function(v) {
				return /^0x[a-fA-F0-9]{40}$/.test(v);
			},
			message: props => `${props.value} is not a valid Ethereum address!`
		}
	},
	residenceAddress: {
		type: String,
		required: true
	}
}, { timestamps: true });

const Billing = mongoose.model('Billing', billingSchema);

module.exports = Billing;
