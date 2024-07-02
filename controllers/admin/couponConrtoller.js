const Coupon = require('../../model/couponModel');
const User = require('../../model/userModel');
const Order = require('../../model/orderModel')
const Product = require('../../model/productModel');
const Category = require('../../model/categoryModel');
const mongoose = require('mongoose')






const couponManagementPage = async(req,res)=>{
    try{
        const coupons = await Coupon.find();
        res.render('couponList',{coupon:coupons})
    }catch(error){
        console.log("error in coupon disaplay page",error.message);
    }
}






const addCoupon = async (req, res) => {
    try {
        console.log(req.body,"coupon codfgdfgwdfwqe");
        const { couponcode, expirydate, coupon_discount, minprice, maxdiscount } = req.body;

        let coupon = new Coupon({
            couponCode: couponcode,
            expiry: expirydate,
            discount: coupon_discount,
            maxDiscount: maxdiscount,
            minPrice: minprice,
        });

        await coupon.save();
        res.redirect('/admin/couponManagementPage');
    } catch (error) { 
        console.log(error);
        res.status(500).send('Internal server error');
    }
};







const softDeleteCoupon = async(req,res)=>{
    try{
        const cid = req.body.cid;
        const coupon = await Coupon.findById({_id:cid});
        if(coupon.isListed){
            await Coupon.findByIdAndUpdate(cid,{isListed : false});
            res.status(200).json({unListed : true});
        }
        if(!coupon.isListed){
            await Coupon.findByIdAndUpdate(cid,{isListed : true});
            res.status(200).json({listed : true})
        }
    }catch(error){
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}





const updateCoupon = async(req,res)=>{
    try{
        const couponId = req.query.cid;
        const { editcouponcode ,editexpirydate , editdiscount, editminprice, editmaxdiscount } = req.body;
        await Coupon.findByIdAndUpdate(couponId,{
                couponCode : editcouponcode,
                discount : editdiscount,
                expiry : editexpirydate,
                minPrice : editminprice,
                maxDiscount : editmaxdiscount,
            },
            { new: true }
        )

        res.redirect('/admin/couponManagementPage');
    }catch(error){
        console.log(error);
        res.status(500).send('Internal server error');
    }
}





const applyCoupon = async (req, res) => {
    try {
        const { couponName, cartTotal } = req.body;
        const coupon = await Coupon.findOne({ couponCode: String(couponName) });

        if (!coupon) {
            return res.json({ status: false, message: "Coupon not found." });
        }

        if (parseInt(cartTotal) < parseInt(coupon.minPrice)) {
            return res.json({ status: false, message: "Cart total is less than the minimum amount required for this coupon." });
        }

        const userId = req.session.user_id;
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ status: false, message: "User not found." });
        }

        if (coupon.users.some(item => String(item.userId) === String(user._id))) {
            return res.json({ status: false, message: "You have already used this coupon." });
        }


        return res.json({ status: true, coupon: coupon });
    } catch (error) {
        console.log("Error in apply coupon", error);
        res.status(500).send('Internal server error');
    }
};








const removeCoupon = async(req,res)=>{
    try{

    }catch(error){
        onsole.log("Error in apply coupon", error);
        res.status(500).send('Internal server error');
    }
}






module.exports = {
    couponManagementPage,
    addCoupon,
    softDeleteCoupon,
    updateCoupon,
    applyCoupon,
    removeCoupon
}