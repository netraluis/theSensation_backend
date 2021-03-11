const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  ocupation: [
    {
      bookingId: String,
      date: Date,
      pay: {
        type: Boolean,
        default: false,
      },
    },
  ],
  room: String,
  pay: {
    type: Boolean,
    default: false,
  },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
