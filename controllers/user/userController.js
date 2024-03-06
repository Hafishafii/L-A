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
  res.redirect('/verifyOtp')
}
    }
    catch(error) {
        console.log(error.message);
        throw error;
    }
};




//  resend OTP
const resendOTP=async(req,res)=> {
  try {
  const email=req.session.userData.email;
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





// ------------------load OTP page------------------
const loadotpPage= (req,res)=> {
  res.render('verifyOtp')
}





//................................................................VERIFY OTP.........................
const verifyotp = async(req,res)=>{
  try {
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
}else{
  res.render("verifyOtp", { message: "OTP verification failed" })
}   
  } catch (error) {
    console.log(error);
  }
}


const loadRegister=async (req,res)=> {
    try {
        res.render("login")
    }
    catch(error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error")
    }
};






const loadLogin=async (req,res)=> {
    try {
      const userData = await User.findById(req.session.user_id);
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

  




const loadHome = async (req, res) => {
  try {
      const categories = await Category.find({ isListed: true });
      const products = await Product.find({ isListed: true });

      let userData = null;
      const user = await User.findById(req.session.user_id);

      if (user && user.isActive) {
          userData = user.name;
      } else {
          req.session.user_id = null;
      }

      res.render("home", {
          categories: categories,
          products: products,
          userData: userData
      });
  } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
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
    const product=await Product.findById(product_id);
    const categories = await Category.find({ isListed: true });
    const user = await User.findById(req.session.user_id);
    const userData=user?.name;
  
    res.render("product", {
      categories: categories,
      product: product,
      userData: userData,
      productId :product_id
    });
    
  } catch (error) {
    console.error(error)

    
  }
}



//  load user account page
const loadAccount = async (req, res) => {
    const userData = await User.findById(req.session.user_id);
    const categories = await Category.find();

    res.render("userAccount", {
      userData: userData,
      categories: categories,

    });
};




const loadAddAddress = async (req, res) => {
  try {
    const userData = await User.findById(req.session.user_id);
    const categories = await Category.find();

    res.render("addAddress", {
      userData: userData,
      categories: categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};



// adding address
const addAddress = async (req, res) => {
  try {
    const address = {
      name: req.body.name,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      pinCode: req.body.pinCode,
      phone: req.body.phone,
      email: req.body.email,
      addressType: req.body.addressType,
    };

    console.log(address);
    const user = await User.findById(req.session.user_id);

    user.address.push(address);
    await user.save();

    if (req.session.returnTo1) {
      res.redirect(req.session.returnTo1);
    } else {
      res.redirect("/account");
    }
  } catch (error) {
    console.log(error.message);
  }
};




// load edit address
const loadEditAddress = async (req, res) => {
  try {
    const addressIndex = req.params.id;
    const userData = await User.findById(req.session.user_id);
    const categories = await Category.find();

    const user = await User.findById(req.session.user_id);
    if (!user || !user.address || addressIndex < 0 || addressIndex >= user.address.length) {
      throw new Error('Address not found or invalid address index');
    }

    const address = user.address[addressIndex];
    console.log("Addresssssss:", address);

    res.render("editAddress", {
      address: address,
      addressIndex: addressIndex,
      userData: userData,
      categories: categories,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};





// edit address
const editAddress = async (req, res) => {
  try {
    console.log(req.body,"Bodyyyyyyyyyyyyyyyyyyyyyyyyy");
    const user = await User.findById(req.session.user_id);
    const addressId = req.params.addressid;
    console.log(addressId,"idsdsdsdsdsdsdsdsdshrgfdeg");

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        "address._id": addressId,
      },
      {
        $set: {
          "address.$.name": req.body.name,
          "address.$.addressLine1": req.body.addressLine1,
          "address.$.addressLine2": req.body.addressLine2,
          "address.$.city": req.body.city,
          "address.$.state": req.body.state,
          "address.$.pinCode": req.body.pinCode,
          "address.$.phone": req.body.phone,
          "address.$.email": req.body.email,
          "address.$.addressType": req.body.addressType,
        },
      },
      { new: true }
    );

    if (updatedUser) {
      console.log("User address updated:", updatedUser);
      res.redirect("/account");
    } else {
      console.log("Address not found or user not found.");
    }
  } catch (error) {
    console.log(error.message);
  }
};





// delete address
const deleteAddress = async (req, res) => {
  try {
    console.log('deleteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
    const userId = req.session.user_id;
    const addressId = req.params.addressId;

    const user = await User.findById(userId);

    const addressIndex = user.address.findIndex(address => address._id.toString() === addressId);

    if (addressIndex !== -1) {
      user.address.splice(addressIndex, 1);
      await user.save();
      res.status(200).json({ message: 'Address deleted successfully' });
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};




const searchResult = async (req, res) => {
  try {
    console.log(req.body);
    const userData = await User.findById(req.session.user_id);
    const categories = await Category.find();

    const search = req.body.search;

    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 3;

    const result = await Product.find({
      $or: [
        { productName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.find({
      $or: [
        { productName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ],
    }).countDocuments();
    console.log(count);
    console.log(Math.ceil(count / limit));
    console.log(page);

    console.log(result);
    res.render("categoryFind", {
      products: result,
      userData: userData,
      totalPages: Math.ceil(count / limit),
      page: page,
      categories: categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};



module.exports = {
    loadRegister,
    loadLogin,
    userLogin,
    userLogOut,
    loadHome,
    sendMail,
    verifyotp,
    productView,
    resendOTP,
    loadotpPage,
    loadAccount,
    addAddress,
    loadAddAddress,
    loadEditAddress,
    editAddress,
    deleteAddress,
    searchResult
}