const express=require("express");
const user_route=express();
const session=require('express-session');
const config=require("../config/config")
const auth=require('../middleware/userAuth')


user_route.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:false,
}));


user_route.set('view engine', 'ejs');
user_route.set('views','./views/userSide')






const userController = require("../controllers/user/userController");



user_route.get('/',userController.loadHome)
user_route.get('/signup',auth.isLogOut,userController.loadRegister)
user_route.post('/signup',auth.isLogOut,userController.sendMail)
user_route.get('/login',auth.isLogOut,userController.loadLogin)
user_route.post('/login',userController.userLogin)
user_route.get('/logout',userController.userLogOut)
user_route.post('/verifyOtp',auth.isLogOut,userController.verifyotp)
user_route.get('/resendOTP',userController.resendOTP)

user_route.get('/productview',auth.isLogIn,userController.productView)


module.exports = user_route;  