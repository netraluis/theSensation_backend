const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  occupation: [
    {
      paymentMethodId: String,
      startDate: Date,
      endDate: Date,
      pay: {
        type: Boolean,
        default: false,
      },
    },
  ],
  room: String,
  description: String
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
