const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");
const Price = require ("../models/priceModel");
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
    let prices = await Price.find({})

    console.log({prices})
    let extraPriceAcumulator = 0;
    extras.forEach(extra => {
      const extraPrice = prices.find(price => price.subject === extra.extra)
      const quantity = extra.quantity || 1;
      extraPriceAcumulator = extraPriceAcumulator + quantity*extraPrice.price
    });
    const roomPrice = prices.find(price => price.subject === 'room')
    const totalPrice = roomPrice.price*differenceDays + extraPriceAcumulator;
    req.body.totalPrice = totalPrice;

    
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
  const { paymentId, amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      payment_method_types: ["card"],
      payment_method: paymentId,
      off_session: true,
      confirm: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        paymentIntent,
      },
    });
  } catch (e) {
    return next(new AppError("payment method error", 401));
  }
});
