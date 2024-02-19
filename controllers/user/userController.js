const User=require("../../model/userModel");
const Category=require("../../model/categoryModel");
const Product=require("../../model/productModel");
const bcrypt=require("bcrypt");
const nodemailer=require("nodemailer");
const dotenv=require("dotenv");
const { name } = require("ejs");
dotenv.config({path:".env"});



const securePassword=async(password) => {
    try {
        const passwordHash=await bcrypt.hash(password,10);
        return passwordHash;
    }
    catch(error) {
        console.log(error.message);
    }
}




const generateOtp=()=> {
    return Math.floor(Math.random()*9000+1000);
}




const sendMail=async (req,res)=> {
    try {
      const email = req.body.email
      req.session.userData = req.body
      const existingEmail=await User.findOne({email:email});

      if(existingEmail) {
          res.render("login", {
              message:"email already registered, try logging in.",
          })
      }



        const otp=generateOtp();
        console.log(otp);

        const transporter=nodemailer.createTransport({
            service:"gmail",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.EMAIL,
                pass:process.env.PASSWORD,
            },
        })
        const info = await transporter.sendMail({
          from: process.EMAIL,
        to: email,
        subject: "verify Your Account",
        text:`Your OTP is :${otp}`,
        html: `<b> <h4> Your OTP is:${otp}</h4>  <br> <a href="/user/emailOTP/">Click here</a></b>`,

        })
 
if(info){
  console.log("email has been sent this is otp:"+otp)
  req.session.otp = otp
  res.render('verifyOtp')
}
    }
    catch(error) {
        console.log(error.message);
        throw error;
    }
};


//hafis


//  resend OTP
const resendOTP=async(req,res)=> {
  try {
    const email=req.session.userData.email;

    console.log('hereeeeeeeeeeeeeeeeeeeeeeeeeeee',email);
const otp = generateOtp()
console.log(otp);
req.session.otp = otp;
const transporter=nodemailer.createTransport({
  service:"gmail",
  port:587,
  secure:false,
  requireTLS:true,
  auth:{
      user:process.env.EMAIL,
      pass:process.env.PASSWORD,
  },
})
const info = await transporter.sendMail({
from: process.EMAIL,
to: email,
subject: "verify Your Account",
text:`Your OTP is :${otp}`,
html: `<b> <h4> Your OTP is:${otp}</h4></b>`,

});

if(info){
  console.log("otp resend--");
res.json({ success: true, otp:otp  });
}

} catch{
  console.log(error.message);
}
}



//................................................................VERIFY OTP.........................
const verifyotp = async(req,res)=>{
  try {
    const categories = await Category.find({ isListed: true });
    const products = await Product.find({ isListed: true });
const otp = req.body.verify;
const rotp = req.session.otp;
console.log(otp+rotp)

if(rotp == otp){
  const user = req.session.userData
  const sPassword = await securePassword(user.password);
  const newuser = new User ({
    name: user.name,
    email: user.email,
    password: sPassword,
    phoneNumber: user.phoneNumber,
    isAdmin: 0,
  });
  const savedUser = await newuser.save();
          req.session.isActive = savedUser.isActive;
          req.session.user_id = savedUser._id;
          const userData = savedUser.name;
          console.log(savedUser);
          res.redirect("/");
          // res.render("home",{userData,products,categories});
            // res.render("home",{userData,
            // });
}else{
  res.render("verifyOtp", { message: "OTP verification failed" })
//   res.render("login", {
//     message:"otp error.",
// });
}
    
  } catch (error) {
    console.log(error);
  }
}


const loadRegister=async (req,res)=> {
    try {
        res.render("login", {
            userData:userData,
            // categor:categories,
        })
    }
    catch(error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error")
    }
};






const loadLogin=async (req,res)=> {
    try {
      const userData = await User.findById(req.session.user_id);
    //   const categories = await Category.find();
  
      res.render("login");
    }
    catch(error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
};






const userLogin=async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      console.log(req.body.email);
  
      const user = await User.findOne({ email: email });
      if(user) {
        const passwordMatch = await bcrypt.compare(password, user.password);
  
        if (user.isActive === false) {
          res.render("login", {
            message:
            "Access to your account is currently  blocked by admin, contact admin for more details",
          });
        } 
        else if(passwordMatch && user.isAdmin === 0) {
          req.session.user_id = user._id;
          const userData = user.name;
          req.session.isActive = user.isActive;
          console.log(user);
          console.log(user.isActive);
          const categories = await Category.find({ isListed: true });
          const products = await Product.find({ isListed: true });
          if (req.session?.returnTo) {
            res.redirect(req.session.returnTo);
          }
          else {
            res.redirect("/");
          }
        }
        else {
        res.render("login", { message: "Email or Password Incorrect" });
        }
      }
    }
    catch(error) {
      console.log(error.message);
    }
};





const userLogOut=async (req, res) => {
    try {
      const userSession = req.session.user
      req.session.destroy();
      res.redirect("/login");
    } catch (error) {
      console.log(error.message);
    }
};

  




const loadHome=async (req, res) => {

    try {
      const categories = await Category.find({ isListed: true });
      const products = await Product.find({ isListed: true });
      const user = await User.findById(req.session.user_id);
      const userData=user?.name;
    
      console.log("user",userData);

      console.log(products,categories);
      res.render("home", {
        categories: categories,
        products: products,
        userData: userData
      });
    } 
    catch (error) {
      console.log(error.message);
    }
};





const error=async (req,res)=> {
    try {
        res.render("errorPage");
    }
    catch(error) {
        console.log(error.message);
    }
}


const productView=async(req,res)=>{
  try {
    const product_id=req.query.productid;
    console.log(product_id);
    const product=await Product.findById(product_id);
    const categories = await Category.find({ isListed: true });
    const user = await User.findById(req.session.user_id);
    const userData=user?.name;
  
    console.log("user",userData);

    console.log(product,categories);
    res.render("product", {
      categories: categories,
      product: product,
      userData: userData
    });
    
  } catch (error) {
    console.error(error)

    
  }
}



module.exports = {
    loadRegister,
    loadLogin,
    userLogin,
    userLogOut,
    loadHome,
    sendMail,
    verifyotp,
    productView,
    resendOTP
}