const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getOrder, updateOrderStatus, payWithStripe, payWithWallet } = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");


// Routes
router.post("/", protect, createOrder); 
router.get("/", protect, getOrders);    
router.get("/:id", protect, getOrder);   
router.patch("/:id", protect, adminOnly, updateOrderStatus);   

router.post("/create-payment-intent", payWithStripe);
router.post("/payWithWallet", protect, payWithWallet);

module.exports = router;
