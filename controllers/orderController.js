const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { calculateTotalPrice } = require("../utils");
const User = require("../models/userModel");

// Créer une commande
const createOrder = asyncHandler(async (req, res) => {
    const { orderDate, orderTime, orderAmount, cartItems, shippingAddress, paymentMethod } = req.body;
    const orderStatus = req.body.orderStatus || "Order Placed"; // Par défaut si non fourni

    console.log(req.body);

    if (!cartItems) throw new Error("Cart items are missing.");
    if (!shippingAddress) throw new Error("Shipping address is missing.");
    if (!paymentMethod) throw new Error("Payment method is missing.");

    const order = await Order.create({
        user: req.user._id,
        orderDate,
        orderTime,
        orderAmount,
        orderStatus,
        cartItems,
        shippingAddress,
        paymentMethod,
    });

    res.status(201).json(order);
});

// Récupérer toutes les commandes
const getOrders = asyncHandler(async (req, res) => {
    let orders;
    if (req.user.role === "admin") {
        orders = await Order.find().sort("-createdAt");
    } else {
        orders = await Order.find({ user: req.user._id }).sort("-createdAt");
    }
    res.status(200).json(orders);
});

// Récupérer une seule commande
const getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new Error("Order not found");

    if (req.user.role === "admin" || order.user.toString() === req.user._id.toString()) {
        return res.status(200).json(order);
    }

    res.status(401);
    throw new Error("User not authorized");
});

// Mettre à jour le statut de la commande
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderStatus } = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) throw new Error("Order not found");

    await Order.findByIdAndUpdate(id, { orderStatus }, { new: true, runValidators: true });
    res.status(200).json({ message: "Order status updated" });
});

// Paiement avec Stripe
//const payWithStripe = asyncHandler(async (req, res) => {
  //  const { items, shipping, description, paymentMethod } = req.body;

   // const products = await Product.find();
  //  const orderAmount = calculateTotalPrice(products, items);

   // if (!paymentMethod) throw new Error("No payment method selected");

   // const paymentIntent = await stripe.paymentIntents.create({
   //     amount: orderAmount,
    //    currency: "eur",
    //    automatic_payment_methods: { enabled: true },
    //    description,
    //    shipping: {
      //      address: {
        //        line1: shipping.line1,
        //        line2: shipping.line2,
        //        city: shipping.city,
        //        country: shipping.country,
        //        postal_code: shipping.postal_code,
        //    },
        //    name: shipping.name,
        //    phone: shipping.phone,
      //  },
    //});

   // res.status(200).json({ clientSecret: paymentIntent.client_secret });
//});

const payWithStripe = asyncHandler(async (req, res) => {
  console.log("Received request for payment intent."); // Ajout d'un log ici

    const { items, shipping, description, paymentMethod } = req.body;
  
    const products = await Product.find();
  
    let orderAmount;
    orderAmount = calculateTotalPrice(products, items);
  
    if (!paymentMethod) {
      res.status(400);
      throw new Error("No payment method selected");
    }
console.log("Creating payment intent with amount:", orderAmount);
console.log("Using Stripe secret key:", process.env.STRIPE_SECRET_KEY); // Vérifie ici

    const paymentIntent = await stripe.paymentIntents.create({
      amount: orderAmount,
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
      //receipt_email: customerEmail
    });
  
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  });

  const payWithWallet = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { items, cartItems, shippingAddress } = req.body;

    const products = await Product.find();
    const today = new Date();


    let orderAmount;
    orderAmount = calculateTotalPrice(products, items);

    if (user.balance < orderAmount) {
      res.status(400);
      throw new Error("Insufficient balance");
    }

    const newTransaction = await Transaction.create({
      amount: orderAmount,
      sender: user.email,
      receiver: "LightFitness",
      description: "Payment for products.",
      status: "success",
    });

     // decrease the sender's balance
    const newBalance = await User.findOneAndUpdate(
    { email: user.email },
    {
      $inc: { balance: -orderAmount },
    }
    );

    const newOrder = await Order.create({
      user: user._id,
      orderDate: today.toDateString(),
      orderTime: today.toLocaleTimeString(),
      orderAmount,
      orderStatus: "Order Placed...",
      cartItems,
      shippingAddress,
      paymentMethod: "LightFitness Wallet",
    });

     // Update Product quantity
     await updateProductQuantity(cartItems);   //const updatedProduct =

     // Send Order Email to the user
  const subject = "LightFitness Order Placed";
  const send_to = user.email;
  const template = orderSuccessEmail(user.name, cartItems);
  const reply_to = "no_reply@shopito.com";


  await sendEmail(subject, send_to, template, reply_to);

  if (newTransaction && newBalance && newOrder) {
    return res.status(200).json({
      message: "Payment successful",
      url: `${process.env.FRONTEND_URL}/checkout-success`,
    });
  }
  res
    .status(400).json({ message: "Something went wrong, please contact admin" });

  })

  
module.exports = { createOrder, getOrders, getOrder, updateOrderStatus, payWithStripe, payWithWallet };
