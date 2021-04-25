const express = require('express');

const router = express.Router();

const bookingController = require('../controllers/bookingController')

const authController = require('../controllers/authController');

router.route('/').get(bookingController.roomAviability).post( bookingController.roomBooking);

router.route('/aviability').post(bookingController.roomAviability);

router.route('/payment').post(bookingController.paymentBooking).get(authController.protect, bookingController.bookings);

// router.route('/all').get(bookingController.bookings)

module.exports = router;