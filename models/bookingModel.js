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
      quantity: Number,
      comments: String,
    },
  ],
  dates: {
    type: [
      {
        day: Date,
      },
    ],
    required: [true, "date is required to know the ocupation"],
  },
  room: String,
  email: {
    type: String,
    required: [true, "email is required"],
    lowercase: true,
    validate: [validator.isEmail, "invalid email"],
  },
  name: String,
  pay: {
      type: Boolean,
      default: false
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
