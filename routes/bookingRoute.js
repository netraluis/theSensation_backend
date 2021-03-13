const express = require('express');

const router = express.Router();

const bookingController = require('../controllers/bookingController')

router.route('/').post(bookingController.roomBooking);
router.route('/payment').post(bookingController.paymentBooking)

module.exports = router;