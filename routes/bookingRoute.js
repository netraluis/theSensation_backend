const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController')
const authController = require('../controllers/authController');

router.route('/').post( bookingController.roomBooking);

router.route('/aviability').post(bookingController.roomAviability);

router.route('/payment').post(authController.protect, bookingController.paymentBooking).get(authController.protect, bookingController.bookings);


module.exports = router;
