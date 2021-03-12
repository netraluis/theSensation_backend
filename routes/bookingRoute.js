const express = require('express');

const router = express.Router();

const bookingController = require('../controllers/bookingController')

router.route('/').post(bookingController.roomBooking);

module.exports = router;