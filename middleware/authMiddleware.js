const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.token; // Utiliser l'opérateur "?" pour éviter l'erreur si "cookies" est indéfini

    if (!token) {
        return res.status(401).json({ message: "Not authorized, please login" });
    }

    try {
        // Verify Token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Not authorized, please login" });
    }
});

// Admin only
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as an admin" });
    }
};

module.exports = { protect, adminOnly };

