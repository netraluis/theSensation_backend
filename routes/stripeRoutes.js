const express = require('express');

const router = express.Router();

const stripeController = require('../controllers/stripeController')



router.route("/stripe-checkout-session").post(stripeController.checkoutSession);

router.route("/prueba").post(stripeController.prueba)

module.exports = router;