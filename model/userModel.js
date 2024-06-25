const mongoose = require('mongoose');
const moment = require('moment-timezone');

const addressSchema = new mongoose.Schema({
    name: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pinCode: String,
    phone: String,
    email: String,
    addressType: String
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    cart: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        quantity: Number,
    }],
    wishlist: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        }
    }],
    address: [addressSchema]
});

module.exports = mongoose.model('User', userSchema);
