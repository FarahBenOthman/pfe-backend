const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all required fields");
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be up to 6 characters");
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("Email has already been registered");
    }

    // Create new user
    const user = await User.create({
        name,
        email,
        password,
    });

    // Generate Token
    const token = generateToken(user._id);
    console.log("Generated Token:", token); // Log le token généré

    if (user) {
        const { _id, name, email, role } = user;
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400),
            // secure: true,
            // sameSite: none,
        });

        // Send user data
        res.status(201).json({
            _id,
            name,
            email,
            role,
            token, // Inclus le token dans la réponse
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
        res.status(400);
        throw new Error("Please add email and password");
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error("User does not exist.");
    }

    // User exists, check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    // Generate Token
    const token = generateToken(user._id);
    console.log("Generated Token:", token); // Log le token généré

    if (user && passwordIsCorrect) {
        const newUser = await User.findOne({ email }).select("-password");
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400),
            // secure: true,
            // sameSite: none,
        });
    
        // Send user data with token
        res.status(200).json({
            user: newUser,
            token, // Inclure le token ici
        });
    }else {
        res.status(400);
        throw new Error("Invalid email or password");
    }
});

// Logout
const logout = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        // secure: true,
        // sameSite: none,
    });
    res.status(200).json({ message: "Successfully Logged Out" });
});

// Get User
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(400);
        throw new Error("User Not Found");
    }
});

// Get login status
const getLoginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false);
    }

    // Verify Token
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (verified) {
            res.json(true);
        } else {
            res.json(false);
        }
    } catch (error) {
        console.error("Token verification error:", error.message); // Log l'erreur de vérification
        res.json(false);
    }
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { name, phone, address } = user;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.address = req.body.address || address;

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// Save cart
const saveCart = asyncHandler(async (req, res) => {
    const { cartItems } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
        user.cartItems = cartItems;
        await user.save();
        res.status(200).json({ message: "Cart saved" });
    } else {
        res.status(400);
        throw new Error("User Not Found");
    }
});

// Get cart
const getCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.status(200).json(user.cartItems);
    } else {
        res.status(400);
        throw new Error("User Not Found");
    }
});

// Add product to wishlist
const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    await User.findOneAndUpdate(
        { email: req.user.email },
        { $addToSet: { wishlist: productId } }
    );

    res.json({ message: "Product added to wishlist" });
});

// Get Wishlist
const getWishlist = asyncHandler(async (req, res) => {
    const list = await User.findOne({ email: req.user.email })
        .select("wishlist")
        .populate("wishlist");

    res.json(list);
});

// Remove from wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    await User.findOneAndUpdate(
        { email: req.user.email },
        { $pull: { wishlist: productId } }
    );

    res.json({ message: "Product removed from wishlist" });
});

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    getLoginStatus,
    updateUser,
    saveCart,
    getCart,
    addToWishlist,
    getWishlist,
    removeFromWishlist,
}; 