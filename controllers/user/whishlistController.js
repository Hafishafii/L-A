const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const Category = require("../../model/categoryModel");
const Order = require("../../model/orderModel");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');






const addToWishlist = async(req, res) => {
    try {
        const productId = req.body.productId;
        if (!req.session.user_id) {
            return res.status(200).json({ notLogin: true });
        }
        const user = await User.findById(req.session.user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const existingItem = user.wishlist.find(item => item.productId.equals(productId));
        if (existingItem) {
            user.wishlist = user.wishlist.filter(item => !item.productId.equals(productId));
        } else {
            user.wishlist.push({ productId });
        }
        await user.save({ versionKey: false }); 
        if (existingItem) {
            return res.status(200).json({ removedFromWishlist: true, wishlistSize: user.wishlist.length });
        } else {
            return res.status(200).json({ addedToWishlist: true, wishlistSize: user.wishlist.length });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
};




const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id;

        if (!userId) {
            return res.redirect('/login');
        }

        const user = await User.findById(userId).populate('wishlist.productId');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const wishlistProducts = user.wishlist.map(item => {
            return {
                ...item.productId.toObject(),
                isInWishlist: true
            };
        });

        return res.render('wishlist', { products: wishlistProducts });
    } catch (error) {
        console.error("Error loading wishlist:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};






const removeFromWishlist = async (req, res) => {
    try {
        const productId = req.body.productId;
        if (!req.session.user_id) {
            return res.status(200).json({ notLogin: true });
        }

        const user = await User.findById(req.session.user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingItem = user.wishlist.find(item => item.productId.equals(productId));
        if (existingItem) {
            user.wishlist = user.wishlist.filter(item => !item.productId.equals(productId));
            await user.save();
            return res.status(200).json({ removedFromWishlist: true, wishlistSize: user.wishlist.length });
        } else {
            return res.status(400).json({ message: "Item not found in wishlist" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
};






const toggleWishlist = async (req, res) => {
    try {
        const productId = req.body.productId;
        if (!req.session.user_id) {
            return res.status(200).json({ notLogin: true });
        }

        const user = await User.findById(req.session.user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingItem = user.wishlist.find(item => item.productId.equals(productId));
        if (existingItem) {
            user.wishlist = user.wishlist.filter(item => !item.productId.equals(productId));
            await user.save();
            return res.status(200).json({ removedFromWishlist: true, wishlistSize: user.wishlist.length });
        } else {
            user.wishlist.push({ productId });
            await user.save();
            return res.status(200).json({ addedToWishlist: true, wishlistSize: user.wishlist.length });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
};








module.exports = {
    addToWishlist,
    loadWishlist,
    removeFromWishlist,
    toggleWishlist
};