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
  // dates: {
  //   type: [Date],
  //   default: [],
  //   required: [true, "need dates to complete the reservation"],
  // },
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

// bookingSchema.pre("save", function (next) {
//   //funcion para sumar dias
//   Date.prototype.addDays = function (days) {
//     let date = new Date(this.valueOf());
//     date.setDate(date.getDate() + days);
//     return date;
//   };

//   let currentDate = this.startDate;
//   while (currentDate <= this.endDate) {
//     this.dates.push(new Date(currentDate));
//     currentDate = currentDate.addDays(1);
//   }
//   next();
// });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
