const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const { ObjectId } = mongoose.Schema;

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a name"],
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            trim: true,
            match: [ /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 
            "Please add a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minLength: [6, "Password must be up to 6 characters"],

        },
        role: {
            type: String,
            required: [true],
            default: "customer",
            enum: ["customer", "admin"],
        },
        //photo: {
           // type: String,
          //  required: [true, "Please add a photo"],
           // default: "",
       // },
        phone: {
            type: String,
            default: "+216",
        },
        address: {
            type: Object,
        },
        wishlist: [{ type: ObjectId, ref: "Product" }],
        balance: {
          type: Number,
          default: 0,
        },
        cartItems: {
            type:  [Object],
        }
    },
    {
        timestamps: true,
    }
);



//Encrypt pass before saving to Db
userSchema.pre("save", async function(next) {
    try {
        if (!this.isModified("password")) {
            return next();
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});





const User = mongoose.model("User", userSchema);
module.exports = User;