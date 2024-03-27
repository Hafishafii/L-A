const Order = require('../../model/orderModel')
const User = require('../../model/userModel')
const Product = require('../../model/productModel')





//load orders
const loadOrders = async (req, res) => {
    try {
        const orders = await Order.find()
        .populate('customerId')
        .populate({
            path: 'products.productId', 
            model: 'Product' 
        });

res.render('orderDetails', { orders: orders });
} catch (error) {
    res.redirect('/error')

}
}





const changeStatus = async (req, res) => {
    try {
        console.log(req.body.status);
        const id = req.body.id;
        console.log(id);
        const order = await Order.findById(id);
        await Order.findByIdAndUpdate(id, { orderStatus: req.body.status });
        if(req.body.status === "DELIVERED"){
            await Order.findByIdAndUpdate(id, { deliveredOn: new Date() });
        } else if(req.body.status === "CANCELLED"){
            if (order) {
                for (const orderItem of order.products) {
                    const product = await Product.findById(orderItem.productId);
                    if (product) {
                        product.quantity += orderItem.quantity;
                        await product.save();
                        console.log("quantity increased");
                    }
                }
            }
        }
        req.flash('success', 'Order status updated successfully.');
        res.redirect('/admin/orders');
    } catch (error) {
        res.redirect('/error')

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