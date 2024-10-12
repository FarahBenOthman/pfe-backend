const asyncHandler=require("express-async-handler");
const Order = require("../models/orderModel");
const { calculateTotalPrice } = require("../utils");
const Product = require("../models/productModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
//const { default: mongoose } = require("mongoose");



//const createOrder = asyncHandler(async(req, res) => {
    
  //  const { 
    //    orderDate,
      //  orderTime,
       // orderAmount,
        //orderStatus,
        //cartItems,
        //shippingAddress,
        //paymentMethod, } = req.body

    // Validation

    //if (!cartItems || !orderStatus || !shippingAddress || !paymentMethod ) {
      //  res.status(400)
       // throw new Error("Order data missing");
    //}

    // Create order
    //await Order.create({
    //const order = await Order.create({
      //  user: req.user._id,
       // orderDate,
       // orderTime,
       // orderAmount,
        //orderStatus,
        //cartItems,
        //shippingAddress,
        //paymentMethod,
    //})

    //res.status(201).json({ message: "Order created"});

    
//})

const createOrder = asyncHandler(async (req, res) => {
    
    const { 
        orderDate,
        orderTime,
        orderAmount,
        cartItems,
        shippingAddress,
        paymentMethod,
    } = req.body;

    const orderStatus = req.body.orderStatus  // Set default value if not provided

    // Debug: log the request body to check incoming data
    console.log(req.body);

    // Validation: Check each field and provide specific error messages
    if (!cartItems) {
        res.status(400);
        throw new Error("Cart items are missing.");
    }
    if (!shippingAddress) {
        res.status(400);
        throw new Error("Shipping address is missing.");
    }
    if (!paymentMethod) {
        res.status(400);
        throw new Error("Payment method is missing.");
    }

    // Create order
    const order = await Order.create({
        user: req.user._id,
        orderDate,
        orderTime,
        orderAmount,
        orderStatus,   // Use the potentially defaulted orderStatus
        cartItems,
        shippingAddress,
        paymentMethod,
    });

    // Respond with the newly created order
    res.status(201).json(order);
});




// Get orders

const getOrders = asyncHandler (async (req, res) => {
      let orders;
      if(req.user.role === "admin"){
         orders = await Order.find().sort("-createdAt")
         return res.status(200).json(orders)
      }
         orders = await Order.find({user: req.user._id}).sort("-createdAt")
         return res.status(200).json(orders)
})


// Get single order

const getOrder = asyncHandler (async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found")
    }

    if (req.user.role === "admin") {
        return res.status(200).json(order)
    }

    // Match order to user

    if (order.user.toString() !== req.user._id.toString()) {
        res.status(401)
        throw new Error("User not authorized")
    }
    res.status(200).json(order)
})


// Update order status

const updateOrderStatus = asyncHandler (async (req, res) => {
      const { orderStatus } = req.body;
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        res.status(404);
        throw new Error("Order not found")
      }

      await Order.findByIdAndUpdate(
        { _id: id},
        { 
            orderStatus
        },
        {
            new: true,
            runValidators: true,
        }
    
    );

    res.status(200).json({message: "Order status updated"})
})

// Pay with stripe
const payWithStripe = asyncHandler(async (req, res) => {
    const { items, shipping, description } = req.body;
    const products = await Product.find();

    let orderAmount;
    orderAmount = calculateTotalPrice(products, items);

    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      description,
      shipping: {
        address: {
          line1: shipping.line1,
          line2: shipping.line2,
          city: shipping.city,
          country: shipping.country,
          postal_code: shipping.postal_code,
        },
        name: shipping.name,
        phone: shipping.phone,
      },
    });
  
    res.send({
      clientSecret: paymentIntent.client_secret,
    //  dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
    });
});

module.exports= { createOrder, getOrders, getOrder, updateOrderStatus, payWithStripe  }