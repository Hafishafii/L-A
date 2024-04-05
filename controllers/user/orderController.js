const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const Category = require("../../model/categoryModel");
const Order = require("../../model/orderModel");
const mongoose = require("mongoose");
const { stringify } = require("querystring");


//load order details page
const loadOrderList = async (req, res) => {
  console.log('loadOOOOOOOOOOOOOOOOOO');
  try {
    const userData = await User.findById(req.session.user_id);
    const categories = await Category.find();
    const orders = await Order.find({ customerId: req.session.user_id });

    res.render('orderList', { orders: orders, userData: userData, categories: categories });
  }catch (error) {
    res.redirect('/error')
    
  }
};






//checkout
const checkout = async (req, res) => {
  try {
    console.log("Checkout request body:", req.body);
    const userId = req.session.user_id;
    
    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(400).json({
        status: false,
        message: "User or user's cart not found",
      });
    }

    const selectedAddressIndex = parseInt(req.body['selected-address-index'], 10);
    if (isNaN(selectedAddressIndex) || selectedAddressIndex < 0 || selectedAddressIndex >= user.address.length) {
      return res.status(400).json({
        status: false,
        message: "Invalid selected address index",
      });
    }
    const selectedAddress = user.address[selectedAddressIndex];

    const productsOutOfStock = [];
    for (const cartItem of user.cart) {
      const product = await Product.findById(cartItem.productId).exec();
      if (!product || product.quantity < cartItem.quantity) {
        productsOutOfStock.push(cartItem.productId);
      }
    }

    if (productsOutOfStock.length > 0) {
      return res.status(400).render('orderFailure', { productsOutOfStock });
    }

    const order = new Order({
      customerId: userId,
      products: user.cart,
      totalAmount: req.body.total,
      shippingAddress: selectedAddress,
      paymentDetails: 'COD',
      orderStatus: "PLACED"
    });

    const orderSuccess = await order.save();
    if (!orderSuccess) {
      throw new Error("Failed to save order");
    }

    user.cart = [];
    await user.save();

    for (const cartItem of order.products) {
      await Product.findByIdAndUpdate(cartItem.productId, { $inc: { quantity: -cartItem.quantity } });
      console.log("Updated product stock for:", cartItem.productId);
    }

    return res.render('successPage', { orderId: order._id });
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).redirect('/error');
  }
};














const showOrders = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const orders = await Order.find({ customerId: userId }).sort({ createdAt: -1 });
    res.render('userAccount', { orders });
  } catch (error) {
    res.redirect('/error')
    
  }
};









// cancel order
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }

    order.orderStatus = "CANCELLED";
    await order.save();

    for (const orderItem of order.products) {
      await Product.findByIdAndUpdate(orderItem.productId, { $inc: { quantity: orderItem.quantity } });
      console.log("Quantity increased for product:", orderItem.productId);
    }

    res.render("orderCancelled");
  } catch (error) {
    console.error("Order Cancellation Error:", error);
    res.status(500).redirect('/error');
  }
};













//order success
const orderSuccess = async (req, res) => {
  try {
    const selectedAddressIndex = req.body['selected-address-index'];
    const paymentMethod = req.body.paymentMethod;

    if (paymentMethod === 'cash-on-delivery' && selectedAddressIndex !== undefined && selectedAddressIndex !== '') {
      res.render("successPage");
    } else {
      res.status(400).send("Please select an address and choose Cash on Delivery payment method to place the order.");
    }
  } catch (error) {
    res.redirect('/error')
    
  }
};






module.exports = {
  loadOrderList,
  checkout,
  cancelOrder,
  orderSuccess,
  showOrders
};