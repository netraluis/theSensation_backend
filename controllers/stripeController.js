const Stripe = require("stripe");
const catchAsync = require("../utils/catchAsync");

exports.checkoutSession = catchAsync(async (req, res, next) => {
  // Set your secret key. Remember to switch to your live secret key in production!
  // See your keys here: https://dashboard.stripe.com/account/apikeys

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  //   const sessions = await stripe.checkout.sessions.list({
  //     limit: 3,
  //   });
  const customer = await stripe.customers.create({
    description: 'My First Test Customer (created for API docs)',
  });
  console.log(customer.id)

  const checkoutSession = await stripe.checkout.sessions.create({
    // billing_address_collection: null,

    cancel_url: "https://example.com/cancel",
    customer: customer.id,
    metadata: {},
    mode: "setup",
    payment_method_types: ["card"],
    // shipping_address_collection: null,
    // submit_type: null,
    success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  });

  console.log({checkoutSessionId:checkoutSession.id});

// //   const sessionsList = await stripe.checkout.sessions.list({
// //     limit: 3,
// //   });

// //   console.log({sessionsList: JSON.stringify(sessionsList)})

// const retrieveSession = await stripe.checkout.sessions.retrieve(checkoutSession.id);
// console.log({retrieveSession})

// const intent = await stripe.setupIntents.retrieve(retrieveSession.setup_intent);
// console.log({intent})
// // const paymentMethod = await stripe.paymentMethods.create({
// //   type: 'card',
// // })

// // console.log({paymentMethod})
// const paymentIntent = await stripe.paymentIntents.create({
//   amount: 2000,
//   currency: 'eur',
//   payment_method_types: ['card'],
//   customer: customer.id,
//   // off_session: true,
//   // paymentMethod: paymentMethod.id
// });

// console.log({paymentIntent})

  res.status(200).json({
    status: "success",
    data: {
        session: checkoutSession
    },
  });
});

exports.prueba = catchAsync(async(req, res)=>{

  const body = req.body.checkoutSessionId
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
//   const retrieveSession = await stripe.checkout.sessions.retrieve(body);
// console.log({retrieveSession})

// const intent = await stripe.setupIntents.retrieve(retrieveSession.setup_intent);
// console.log({intent})

// const paymentMethod = await stripe.paymentMethods.create({
//   type: 'card',
//   card: {
//     number: '4242424242424242',
//     exp_month: 3,
//     exp_year: 2022,
//     cvc: '314',
//   },
// });
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'eur',
  payment_method_types: ['card'],
  // customer: customer.id,
  // off_session: true,
  payment_method: body,
  off_session: true,
    confirm: true,
});

console.log({paymentIntent})

  console.log({body})
  res.status(200).json({
    status: "success",
    data: {
        session: body
    },
  });
})
