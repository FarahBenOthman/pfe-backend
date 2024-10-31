const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { transferFund, webhook } = require("../controllers/transactionController");
const router = express.Router();

router.post("/transferFund", express.json(), protect, transferFund);
router.post("/webhook", express.raw({ type: "application/json" }), webhook);

module.exports = router;