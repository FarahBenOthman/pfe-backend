const mongoose=require("mongoose");


const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    orderDate: {
        type: String,
        required: [true, "Please add an order date"],
        trim: true,
    },
    orderTime: {
        type: String,
        required: [true, "Please add an order date"],
        trim: true,
       // validate: {
         //   validator: function(v) {
                // Check if the date is in a valid format (you can adjust the regex for your needs)
           //     return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(v);
            //},
           /// message: props => `${props.value} is not a valid order date!`
        //}
    },
    orderAmount: {
        type: Number,
        required: [true, "Please add an order amount"],
        trim: true,
    },
    orderStatus: {
        type: String,
        required: [true, "Please add an order status"],
        trim: true,
    },
    cartItems: {
        //type: String,
        type: [Object],
        required: [true],
      },
      shippingAddress: {
        type: Object,
        //type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        trim: true,
    },
},
{ timestamps: true }
);





const Order = mongoose.model("Order", orderSchema);
module.exports = Order;