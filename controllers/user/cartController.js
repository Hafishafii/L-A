const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const Category = require("../../model/categoryModel");
const Order = require("../../model/orderModel");







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

    if (product.quantity === 0) {
      return res.status(400).json({ message: "Product out of stock" });
    }

    const existingItem = user.cart.find(item => item.productId.equals(productId));

    if (existingItem) {
      console.log("Product already in cart, redirecting to cart");
      return res.redirect("/cart");
    } else {
      user.cart.push({ productId, quantity: 1 });
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
        const { productId, count } = req.body;
        const quantityChange = parseInt(count, 10);

        if (isNaN(quantityChange) || quantityChange === 0) {
            return res.status(400).json({ message: "Invalid quantity change provided." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const userCart = await User.findOne({ _id: req.session.user_id });
        const cartItem = userCart.cart.find(item => item.productId.toString() === productId);

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        const newQuantity = cartItem.quantity + quantityChange;
        if (newQuantity < 1 || newQuantity > product.quantity) {
            return res.status(400).json({ message: "Invalid quantity requested" });
        }

        cartItem.quantity = newQuantity;
        await userCart.save();

        res.status(200).json({ message: "Cart updated successfully", cart: userCart.cart });
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        res.status(500).json({ message: "Error updating quantity" });
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