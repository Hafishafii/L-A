const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const Category = require("../../model/categoryModel");
const Order = require("../../model/orderModel");
// const Coupon = require("../../model/couponModel");







//load cart
const loadCart = async (req, res) => {
  try {
    const userData = await User.findById(req.session.user_id);
    const userCart = await User.findOne({ _id: req.session.user_id }).populate(
      "cart.productId"
    );
    const categories = await Category.find();

    let grandTotal = 0;
    for (let i = 0; i < userCart.cart.length; i++) {
      grandTotal =
        grandTotal +
        parseInt(userCart.cart[i].productId.salePrice) *
          parseInt(userCart.cart[i].quantity);
    }
    res.render("cart", {
      userCart: userCart,
      grandTotal: grandTotal,
      userData: userData,
      categories: categories,
    });
  } catch (error) {
    res.redirect('/error')
    
  }
};










//add to cart
const addToCart = async (req, res) => {
  try {
    const productId = req.body.productId;
    const requestedQuantity = parseInt(req.body.quantity);

    console.log(`ADDTOCART productId-----${productId}   quantity-----${requestedQuantity}`);

    if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const userId = req.session.user_id;
    console.log(`ADDTOCART userId------${userId}`);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < requestedQuantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const existingItem = user.cart.find(item => item.productId.equals(productId));

    if (existingItem) {
      const totalRequestedQuantity = existingItem.quantity + requestedQuantity;
      if (totalRequestedQuantity > product.quantity) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      existingItem.quantity += requestedQuantity;
    } else {
      user.cart.push({ productId, quantity: requestedQuantity });
    }

    await user.save();

    console.log("Product added to cart");
    res.redirect("/cart");
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.redirect('/error');
  }
};










// change quantity in cart
const changeQuantity = async (req, res) => {
  try {
      const { productId, quantity } = req.body;

      for (let i = 0; i < productId.length; i++) {
          await User.updateOne(
              {
                  _id: req.session.user_id,
                  "cart.productId": productId[i],
              },
              {
                  $set: {
                      "cart.$.quantity": parseInt(quantity[i]),
                  },
              }
          );
      }
      res.redirect('/cart');
  } catch (error) {
    res.redirect('/error')
    
  }
};









//delete cart item
const deleteCartItem = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productIdToDelete = req.params.id;

    console.log("productId to remove" + productIdToDelete);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("user" + user);
    user.cart = user.cart.filter(
      (item) => !item.productId.equals(productIdToDelete)
    );

    await user.save();

    console.log("Product removed from cart");

    res.redirect("/cart");
  }catch (error) {
    res.redirect('/error')
    
  }
};









//load checkout
const calculateTotal = (cart) => {
  let total = 0;
  cart.forEach((cartItem) => {
      total += cartItem.productId.salePrice * cartItem.quantity;
  });
  return total;
};

const loadCheckout = async (req, res) => {
  try {
      const userData = await User.findById(req.session.user_id);
      const userCart = await User.findOne({ _id: req.session.user_id }).populate(
          "cart.productId"
      );
      const categories = await Category.find();
      
      res.render("checkout", {
          user: userData,
          userCart: userCart,
          userData: userData,
          categories: categories,
          calculateTotal: calculateTotal 
      });
  }catch (error) {
    res.redirect('/error')
    
  }
};








module.exports = {
  loadCart,
  addToCart,
  changeQuantity,
  deleteCartItem,
  calculateTotal,
  loadCheckout,
};