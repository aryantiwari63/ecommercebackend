const express = require('express');
const paypal = require('paypal-rest-sdk');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();



// Configure PayPal SDK
paypal.configure({
    'mode': process.env.PAYPAL_MODE, // 'sandbox' or 'live'
    'client_id': process.env.PAYPAL_CLIENT_KEY,
    'client_secret': process.env.PAYPAL_SECRET_KEY
});


// Create Payment
exports.payProduct =  async(req, res) => {
    const amount = req.body.price;
     console.log("amount is ",amount);
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:5000/success",
            "cancel_url": "http://localhost:5000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Dynamic Payment",
                    "sku": "001",
                    "price": amount,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amount
            },
            "description": "Payment for dynamic amount"
        }]
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
            console.log(error);
            return res.status(500).send("Error creating payment");
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    return res.redirect(payment.links[i].href); // Redirect to PayPal for approval
                }
            }
        }
    });
};




