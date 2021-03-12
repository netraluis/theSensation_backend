const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
  subject: String,
  price: String
});

const Price = mongoose.model("Price", priceSchema);

module.exports = Price;