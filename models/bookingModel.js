const mongoose = require("mongoose");
const validator = require("validator");

const bookingSchema = new mongoose.Schema({
  paymentMethodId: {
    type: String,
    required: [true, "payment method id is required to do the payment"],
  },
  extras: [
    {
      extra: String,
      quantity: {
        type: Number,
        default: 1,
      },
      comments: String,
    },
  ],
  startDate: {
    type: Date,
    required: [true, "need start date"],
  },
  endDate: {
    type: Date,
    required: [true, "need end date"],
  },
  room: {
    type: String,
    required: [true, "room is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    lowercase: true,
    validate: [validator.isEmail, "invalid email"],
  },
  name: String,
  pay: {
    type: Boolean,
    default: false,
  },
  totalPrice: Number
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
