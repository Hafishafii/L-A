const User = require("../../model/userModel");
const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { name } = require("ejs");
dotenv.config({ path: ".env" });





const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  }catch (error) {
    res.redirect('/error')
    
  }
};







const generateOtp = () => {
  return Math.floor(Math.random() * 9000 + 1000);
};







const sendMail = async (req, res) => {
  try {
    const email = req.body.email;
    req.session.userData = req.body;
    const existingEmail = await User.findOne({ email: email });

    if (existingEmail) {
      res.render("login", {
        message: "email already registered, try logging in.",
      });
    }

    const otp = generateOtp();
    console.log(otp);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const info = await transporter.sendMail({
      from: process.EMAIL,
      to: email,
      subject: "verify Your Account",
      text: `Your OTP is :${otp}`,
      html: `<b> <h4> Your OTP is:${otp}</h4>  <br> <a href="/user/emailOTP/">Click here</a></b>`,
    });

    if (info) {
      console.log("email has been sent this is otp:" + otp);
      req.session.otp = otp;
      res.redirect("/verifyOtp");
    }
  } catch (error) {
    res.redirect('/error')
    
  }
};









//  resend OTP
const resendOTP = async (req, res) => {
  try {
    const email = req.session.userData.email;
    const otp = generateOtp();
    console.log(otp);
    req.session.otp = otp;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const info = await transporter.sendMail({
      from: process.EMAIL,
      to: email,
      subject: "verify Your Account",
      text: `Your OTP is :${otp}`,
      html: `<b> <h4> Your OTP is:${otp}</h4></b>`,
    });

    if (info) {
      console.log("otp resend--");
      res.json({ success: true, otp: otp });
    }
  } catch (error) {
    res.redirect('/error')
    
  }
};








// ------------------load OTP page------------------
const loadotpPage = (req, res) => {
  res.render("verifyOtp");
};







//................................................................VERIFY OTP.........................
const verifyotp = async (req, res) => {
  try {
    const otp = req.body.verify;
    const rotp = req.session.otp;
    console.log(otp + rotp);

    if (rotp == otp) {
      const user = req.session.userData;
      const sPassword = await securePassword(user.password);
      const newuser = new User({
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
    } else {
      res.render("verifyOtp", { message: "OTP verification failed" });
    }
  } catch (error) {
    res.redirect('/error')
    
  }
};









const loadRegister = async (req, res) => {
  try {
    res.render("login");
  }catch (error) {
    res.redirect('/error')
    
  }
};









const loadLogin = async (req, res) => {
  try {
    const userData = await User.findById(req.session.user_id);
    res.render("login");
  } catch (error) {
    res.redirect('/error')
    
  }
};









const userLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.body.email);

    const user = await User.findOne({ email: email });
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (user.isActive === false) {
        res.render("login", {
          message:
            "Access to your account is currently  blocked by admin, contact admin for more details",
        });
      } else if (passwordMatch && user.isAdmin === 0) {
        req.session.user_id = user._id;
        const userData = user.name;
        req.session.isActive = user.isActive;
        console.log(user);
        console.log(user.isActive);
        const categories = await Category.find({ isListed: true });
        const products = await Product.find({ isListed: true });
        if (req.session?.returnTo) {
          res.redirect(req.session.returnTo);
        } else {
          res.redirect("/");
        }
      } else {
        res.render("login", { message: "Email or Password Incorrect" });
      }
    }
  }catch (error) {
    res.redirect('/error')
    
  }
};










const userLogOut = async (req, res) => {
  try {
    const userSession = req.session.user;
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    res.redirect('/error')
    
  }
};










const loadHome = async (req, res) => {
  try {
    const categories = await Category.find({ isListed: true });
    const products = await Product.find({ isListed: true });

    let userData = null;
    let wishlistProductIds = [];

    const user = await User.findById(req.session.user_id);

    if (user && user.isActive) {
      userData = user.name;
      wishlistProductIds = user.wishlist.map(item => item.productId.toString());
    } else {
      req.session.user_id = null;
    }

    const productsWithWishlistStatus = products.map(product => {
      return {
        ...product._doc,
        isInWishlist: wishlistProductIds.includes(product._id.toString())
      };
    });

    console.log(productsWithWishlistStatus);

    res.render("home", {
      categories: categories,
      products: productsWithWishlistStatus,
      userData: userData,
    });
  } catch (error) {
    console.error(error);
    res.redirect('/error');
  }
};











const error = async (req, res) => {
  try {
    res.render("errorPage");
  } catch (error) {
    res.redirect('/error')
    
  }
};








const productView = async (req, res) => {
  try {
    const product_id = req.query.productid;
    const product = await Product.findById(product_id);
    const categories = await Category.find({ isListed: true });
    const user = await User.findById(req.session.user_id);
    const userData = user ? user.name : null;
    const isAvailable = product.quantity > 0;

    let isInWishlist = false;
    if (user) {
      isInWishlist = user.wishlist.some(item => item.productId.toString() === product_id.toString());
    }

    console.log(product);
    res.render("product", {
      categories: categories,
      product: product,
      userData: userData,
      productId: product_id,
      isAvailable: isAvailable,
      isInWishlist: isInWishlist  
    });
  } catch (error) {
    console.error('Error loading product:', error);
    res.redirect('/error');
  }
};











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
    res.redirect('/error')
    
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
      res.redirect("/addresses");
    }
  } catch (error) {
    res.redirect('/error')
    
  }
};











// load edit address
const loadEditAddress = async (req, res) => {
  try {
    const addressId = req.params.id; 
    const userData = await User.findById(req.session.user_id);
    const categories = await Category.find();

    const user = await User.findById(req.session.user_id);
    if (!user || !user.address) {
      throw new Error("User or address not found");
    }

    
    const address = user.address.find(
      (address) => address._id.toString() === addressId
    );
    if (!address) {
      throw new Error("Address not found");
    }

    console.log("Addresssssss:", address);

    res.render("editAddress", {
      address: address,
      userData: userData,
      categories: categories,
    });
  }catch (error) {
    res.redirect('/error')
    
  }
};











// edit address
const editAddress = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id);
    const addressId = req.params.addressid;
    console.log(addressId, "idsdsdsdsdsdsdsdsdshrgfdeg");

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
      res.redirect("/addresses");
    } else {
      console.log("Address not found or user not found.");
    }
  } catch (error) {
    res.redirect('/error')
    
  }
};











// delete address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.params.addressId;

    const user = await User.findById(userId);

    const addressIndex = user.address.findIndex(
      (address) => address._id.toString() === addressId
    );

    if (addressIndex !== -1) {
      user.address.splice(addressIndex, 1);
      await user.save();
      res.status(200).json({ message: "Address deleted successfully" });
    } else {
      res.status(404).json({ message: "Address not found" });
    }
  } catch (error) {
    res.redirect('/error')
    
  }
};











//  search
const searchResult = async (req, res) => {
  try {
      const { user_id: userId } = req.session;
      const userData = await User.findById(userId);
      const categories = await Category.find();

      const { search, sortby, categories: categoriesFilter = [] } = req.query;

      let { page = 1 } = req.query;
      const limit = 3;

      const query = {
          $or: [
              { productName: { $regex: search, $options: "i" } }
          ]
      };

      if (categoriesFilter.length > 0) {
          query.category = { $in: categoriesFilter.map(ObjectId) };
      }

      let sortOptions = {};

      switch (sortby) {
        case 'ascend':
          sortOptions = { productName: 1 };
          break;
        case 'descend':
          sortOptions = { productName: -1 };
          break;
        case 'pricelh':
          sortOptions = { salePrice: 1 };
          break;
        case 'pricehl':
          sortOptions = { salePrice: -1 };
          break;
        case 'new':
          sortOptions = { createdAt: -1 };
          break;
        case 'popularity':
          sortOptions = { views: -1 };
          break;
        default:
          sortOptions = { productName: 1 };
          break;
      }

      const result = await Product.find(query)
          .sort(sortOptions)
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .exec();

      const count = await Product.find(query).countDocuments();
      res.render("categoryFind", {
          products: result,
          userData,
          totalPages: Math.ceil(count / limit),
          page,
          sortby,
          categories,
          search,
      });
  } catch(error) {
      res.redirect('/error')
  }
};





  






//  password update
const updatePassword = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId);

    const isPasswordCorrect = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      return res.render("accountDetails", {
        userData: user,
        activeTab: "tab-account",
        message: "Current password is incorrect",
      });
    }

    if (req.body.newPassword !== req.body.confirmNewPassword) {
      return res.render("accountDetails", {
        userData: user,
        activeTab: "tab-account",
        message: "New password and confirm new password do not match",
      });
    }
    const newPasswordHash = await bcrypt.hash(req.body.newPassword, 10);

    user.password = newPasswordHash;
    await user.save();

    res.render("userAccount", {
      userData: user,
      activeTab: "tab-account",
      message: "Password updated successfully",
    });
  }catch (error) {
    res.redirect('/error')
  }
};










//  loadAddress
const renderAddress = async (req, res) => {
  try {
    console.log("User ID from session:", req.session.user_id);

    const userData = await User.findById(req.session.user_id).populate(
      "address"
    );
    console.log("User data:", userData);

    if (!userData) {
      return res.status(404).send("User not found");
    }

    const categories = await Category.find();

    res.render("address", {
      userData: userData,
      categories: categories,
    });
  }catch (error) {
    res.redirect('/error')
    
  }
};






//  load account 
const renderAccountDetails= async(req,res) => {
  try {
    const userData = await User.findById(req.session.user_id);
    res.render('accountDetails', { userData: userData });
  }catch (error) {
    res.redirect('/error')
    
  }
}







//  errorpage
const errorPage = (req, res) => {
  try {
      res.render('errorPage');
  } catch (error) {
    res.redirect('/error')
    
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
  searchResult,
  updatePassword,
  renderAddress,
  renderAccountDetails,
  errorPage
};