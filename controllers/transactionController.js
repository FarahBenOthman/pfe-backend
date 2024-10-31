const asyncHandler = require("express-async-handler");

const transferFund = asyncHandler(async (req, res) => {
    res.send("Correct");
});

const webhook = asyncHandler(async (req, res) => {});



module.exports = { transferFund, webhook };