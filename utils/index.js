const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// calculateTotalPrice
const calculateTotalPrice = (products, cartItems) => {
  let totalPrice = 0;

  cartItems.forEach(function (cartItem) {
    const product = products.find(function (product) {
      return product._id?.toString() === cartItem._id;
    });

    if (product) {
      const quantity = cartItem.cartQuantity;
      const price = parseFloat(product.price);
      totalPrice += quantity * price;
    }
  });
  return totalPrice * 100;
};

module.exports = {
  calculateTotalPrice,
};