const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");
const Price = require("../models/priceModel");
const Stripe = require("stripe");

exports.roomBooking = catchAsync(async (req, res, next) => {
  const { startDate, endDate, paymentMethodId, room, extras } = req.body;

  ////////////////////////////////////////////////////////////////////////////// crear nueva habitacion/////////////////////

  // const newRoom = await Room.create({
  //   room:'11',
  //   occupation: [{startDate: new Date("1970-01-10"), endDate: new Date("1970-01-10")}]
  // })
  const availability = await Booking.find({
    room: room,
    $or: [
      {
        $and: [
          { startDate: { $lte: new Date(req.body.endDate) } },
          { endDate: { $gte: new Date(req.body.endDate) } },
        ],
      },
      {
        $and: [
          { startDate: { $lte: new Date(req.body.startDate) } },
          { endDate: { $gte: new Date(req.body.startDate) } },
        ],
      },
    ],
  });

  const roomBooking = await Room.updateOne(
    {
      room: room,
      $nor: [
        {
          $and: [
            { "occupation.startDate": { $lte: new Date(endDate) } },
            { "occupation.endDate": { $gte: new Date(endDate) } },
          ],
        },
        {
          $and: [
            { "occupation.startDate": { $lte: new Date(startDate) } },
            { "occupation.endDate": { $gte: new Date(startDate) } },
          ],
        },
      ],
    },
    {
      $addToSet: {
        occupation: [
          {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            paymentMethodId,
          },
        ],
      },
    }
  );

  let differenceDays =
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
    (1000 * 3600 * 24);
  try {
    let prices = await Price.find({});
    let extraPriceAcumulator = 0;
    extras.forEach((extra) => {
      const extraPrice = prices.find((price) => price.subject === extra.extra);
      const quantity = extra.quantity || 1;
      extraPriceAcumulator = extraPriceAcumulator + quantity * extraPrice.price;
    });
    const roomPrice = prices.find((price) => price.subject === "room");
    const totalPrice = roomPrice.price * differenceDays + extraPriceAcumulator;
    req.body.totalPrice = totalPrice;
  } catch (e) {
    next(new AppError("No price for some extra", 500));
  }

  if (!availability.length && !!roomBooking.nModified) {
    let newBooking = await Booking.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        newBooking,
      },
    });
  } else {
    return next(new AppError("Room already booked", 401));
  }
});

exports.paymentBooking = catchAsync(async (req, res, next) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const { paymentMethodId } = req.body;

  const paymentBooking = await Booking.findOne({
    paymentMethodId: paymentMethodId,
    pay: false,
  });
  const amount = paymentBooking.totalPrice;
  const roomBooking = await Room.findOne({ room: paymentBooking.room });
  const paymentBookingUpdate = await Booking.updateOne(
    { paymentMethodId: paymentMethodId, pay: false },
    { pay: true }
  );
  const roomFilter = roomBooking.occupation.filter(
    (occupation) => occupation.paymentMethodId !== paymentMethodId
  );
  const roomFind = roomBooking.occupation.find(
    (occupation) => occupation.paymentMethodId === paymentMethodId
  );
  roomFilter.push({ ...roomFind._doc, pay: true });
  await Room.update({ room: paymentBooking.room }, { occupation: roomFilter });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "eur",
    payment_method_types: ["card"],
    // customer: customer.id,
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      paymentIntent,
    },
  });
});
