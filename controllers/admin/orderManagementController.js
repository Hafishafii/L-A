const Order = require('../../model/orderModel')
const User = require('../../model/userModel')
const Product = require('../../model/productModel')





//load orders
const loadOrders = async (req, res) => {
    try {
        const perPage = 2;
        const page = parseInt(req.query.page) || 1; 

        const totalCount = await Order.countDocuments();
        const totalPages = Math.ceil(totalCount / perPage);
        const skip = (page - 1) * perPage;

        const orders = await Order.find()
            .populate('customerId')
            .populate({
                path: 'products.productId', 
                model: 'Product' 
            })
            .skip(skip) 
            .limit(perPage); 

        res.render('orderDetails', { orders, currentPage: page, totalPages });
    } catch (error) {
        res.redirect('/error');
    }
}






const changeStatus = async (req, res) => {
    try {
        const id = req.body.orderId;
        const newStatus = req.body.newStatus;

        await Order.findByIdAndUpdate(id, { orderStatus: newStatus });

        if (newStatus === "DELIVERED") {
            await Order.findByIdAndUpdate(id, { deliveredOn: new Date() });
        }

        req.flash('success', 'Order status updated successfully.');
        res.redirect('/admin/orders');
    } catch (error) {
        res.redirect('/error');
    }
};







const continueOrder = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                status: false,
                message: "Order not found",
            });
        }
        if (order.orderStatus !== 'CANCELLED') {
            return res.status(400).json({
                status: false,
                message: "Order cannot be cancelled. Its status is not 'PLACED'.",
            });
        }
        order.orderStatus = 'PLACED';
        await order.save();

        res.redirect('/admin/orders')

    } catch (error) {
        res.redirect('/error')

    }
};








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
        if (order.orderStatus !== 'PLACED') {
            return res.status(400).json({
                status: false,
                message: "Order cannot be continued. Its status is not 'CANCELLED'.",
            });
        }
        order.orderStatus = 'CANCELLED';
        await order.save();

        res.redirect('/admin/orders')
    } catch (error) {
        res.redirect('/error')

    }
};

  



module.exports = {
    loadOrders,
    changeStatus,
    continueOrder,
    cancelOrder
}