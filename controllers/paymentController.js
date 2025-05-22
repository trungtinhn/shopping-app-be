const express = require('express');
const router = express.Router();
const STRIPE_SK_TEST = process.env.STRIPE_SK_TEST;
const STRIPE_PK_TEST = process.env.STRIPE_PK_TEST;
const stripe = require('stripe')(STRIPE_SK_TEST);
const paymentController = {
    paymentSheet: async (req, res) => {
        const {totalOrder} = req.body
        // Use an existing Customer ID if this is a returning customer.
        const customer = await stripe.customers.create();
        const ephemeralKey = await stripe.ephemeralKeys.create(
            {customer: customer.id},
            {apiVersion: '2024-04-10'}
        );
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalOrder,
            currency: 'vnd',
            customer: customer.id,
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter
            // is optional because Stripe enables its functionality by default.
            automatic_payment_methods: {
            enabled: true,
            },
        });

        res.json({
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
            publishableKey: STRIPE_PK_TEST
        });
    }
}
module.exports = paymentController