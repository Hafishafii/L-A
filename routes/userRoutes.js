const express=require("express");
const user_route=express();
const session=require('express-session');
const config=require("../config/config")
const auth=require('../middleware/userAuth')


user_route.set('views','./views/userSide')

const userController = require("../controllers/user/userController");
const cartController = require("../controllers/user/cartController")


user_route.get('/',userController.loadHome)
user_route.get('/signup',auth.isLogOut,userController.loadRegister)
user_route.post('/signup',auth.isLogOut,userController.sendMail)
user_route.get('/verifyOtp',auth.isLogOut,userController.loadotpPage)
user_route.post('/verifyOtp',auth.isLogOut,userController.verifyotp)
user_route.get('/resendOTP',userController.resendOTP)
user_route.get('/login',auth.isLogOut,userController.loadLogin)
user_route.post('/login',userController.userLogin)
// user_route.get('/verifyOtp',(req,res)=>{res.redirect("/")});
user_route.get('/logout',auth.isLogIn,userController.userLogOut)
user_route.get('/productview',userController.productView)
user_route.get('/account',auth.isLogIn,userController.loadAccount)
user_route.get('/edit-address/:id',auth.isLogIn, userController.loadEditAddress)
user_route.post('/edit-address/:addressid',auth.isLogIn, userController.editAddress)
user_route.get('/add-address',auth.isLogIn, userController.loadAddAddress)
user_route.post('/add-address', userController.addAddress)
user_route.delete('/delete-address/:addressId', userController.deleteAddress);
user_route.post('/search',userController.searchResult)


user_route.get('/cart',auth.isLogIn,cartController.loadCart)
user_route.post('/add-to-cart',auth.isLogIn, cartController.addToCart)
user_route.post('/change-quantity', cartController.changeQuantity)
user_route.get('/remove-cart/:id', cartController.deleteCartItem)
// user_route.get('/checkout',auth.isLogIn, cartController.loadCheckout)


module.exports = user_route;  