/**
 * Payment Routes
 * Dreams Uncharted Platform - Payment Processing
 */

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const FundingGoal = require('../models/FundingGoal');
const Donation = require('../models/Donation');
const User = require('../models/User');

// Create Stripe Payment Intent
router.post('/stripe/create-payment-intent', async (req, res) => {
    try {
        const {
            fundingGoalId,
            amount,
            currency = 'usd',
            donorName,
            donorEmail,
            message,
            isAnonymous = false,
            rewardTier
        } = req.body;
        
        // Validate required fields
        if (!fundingGoalId || !amount || amount < 0.50) {
            return res.status(400).json({
                success: false,
                message: 'Invalid funding goal or amount (minimum $0.50)'
            });
        }
        
        // Get funding goal
        const fundingGoal = await FundingGoal.findById(fundingGoalId);
        if (!fundingGoal || fundingGoal.status !== 'active') {
            return res.status(404).json({
                success: false,
                message: 'Funding goal not found or not active'
            });
        }
        
        // Create donation record
        const donation = new Donation({
            fundingGoal: fundingGoalId,
            amount: amount,
            currency: currency.toUpperCase(),
            paymentMethod: 'stripe',
            donor: req.user ? req.user.id : null,
            donorName: donorName,
            donorEmail: donorEmail,
            message: message,
            isAnonymous: isAnonymous,
            rewardTier: rewardTier,
            status: 'pending'
        });
        
        await donation.save();
        
        // Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            metadata: {
                donationId: donation._id.toString(),
                fundingGoalId: fundingGoalId,
                donorName: donorName || 'Anonymous',
                platform: 'dreams-uncharted'
            },
            description: `Donation for: ${fundingGoal.title}`,
            receipt_email: donorEmail
        });
        
        // Update donation with payment intent ID
        donation.paymentIntentId = paymentIntent.id;
        donation.status = 'processing';
        await donation.save();
        
        res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                donationId: donation._id,
                paymentIntentId: paymentIntent.id
            }
        });
        
    } catch (error) {
        console.error('Stripe payment intent creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment intent',
            error: error.message
        });
    }
});

// Stripe Webhook Handler
router.post('/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object);
                break;
                
            case 'payment_intent.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;
                
            case 'payment_intent.canceled':
                await handlePaymentCancellation(event.data.object);
                break;
                
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        
        res.json({received: true});
        
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({error: 'Webhook processing failed'});
    }
});

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
    try {
        const donationId = paymentIntent.metadata.donationId;
        const donation = await Donation.findById(donationId);
        
        if (!donation) {
            console.error('Donation not found for payment intent:', paymentIntent.id);
            return;
        }
        
        // Calculate processing fee (Stripe: 2.9% + $0.30)
        const processingFee = Math.round((donation.amount * 0.029 + 0.30) * 100) / 100;
        
        // Update donation
        donation.status = 'completed';
        donation.transactionId = paymentIntent.id;
        donation.processingFee = processingFee;
        donation.processedAt = new Date();
        donation.paymentMetadata = new Map(Object.entries(paymentIntent));
        
        await donation.save();
        
        // Update funding goal
        const fundingGoal = await FundingGoal.findById(donation.fundingGoal);
        if (fundingGoal) {
            fundingGoal.currentAmount += donation.amount;
            fundingGoal.stats.totalDonations += 1;
            
            // Update unique donors count
            const uniqueDonors = await Donation.distinct('donor', {
                fundingGoal: fundingGoal._id,
                status: 'completed',
                donor: { $ne: null }
            });
            fundingGoal.stats.uniqueDonors = uniqueDonors.length;
            
            // Calculate average donation
            fundingGoal.calculateAverageDonation();
            
            await fundingGoal.save();
            
            // Send notifications if goal is reached
            if (fundingGoal.isGoalReached() && fundingGoal.status === 'active') {
                await sendGoalReachedNotification(fundingGoal);
            }
        }
        
        // Send thank you email to donor
        await sendDonationThankYou(donation);
        
        console.log('Payment processed successfully:', donation._id);
        
    } catch (error) {
        console.error('Error handling payment success:', error);
    }
}

// Handle payment failure
async function handlePaymentFailure(paymentIntent) {
    try {
        const donationId = paymentIntent.metadata.donationId;
        const donation = await Donation.findById(donationId);
        
        if (donation) {
            donation.status = 'failed';
            donation.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
            await donation.save();
        }
        
        console.log('Payment failed:', donation?._id, paymentIntent.last_payment_error?.message);
        
    } catch (error) {
        console.error('Error handling payment failure:', error);
    }
}

// Handle payment cancellation
async function handlePaymentCancellation(paymentIntent) {
    try {
        const donationId = paymentIntent.metadata.donationId;
        const donation = await Donation.findById(donationId);
        
        if (donation) {
            donation.status = 'cancelled';
            await donation.save();
        }
        
        console.log('Payment cancelled:', donation?._id);
        
    } catch (error) {
        console.error('Error handling payment cancellation:', error);
    }
}

// PayPal Payment Creation
router.post('/paypal/create-payment', async (req, res) => {
    try {
        const {
            fundingGoalId,
            amount,
            donorName,
            donorEmail,
            message,
            isAnonymous = false,
            rewardTier
        } = req.body;
        
        // Validate required fields
        if (!fundingGoalId || !amount || amount < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid funding goal or amount (minimum $1.00)'
            });
        }
        
        // Get funding goal
        const fundingGoal = await FundingGoal.findById(fundingGoalId);
        if (!fundingGoal || fundingGoal.status !== 'active') {
            return res.status(404).json({
                success: false,
                message: 'Funding goal not found or not active'
            });
        }
        
        // Create donation record
        const donation = new Donation({
            fundingGoal: fundingGoalId,
            amount: amount,
            currency: 'USD',
            paymentMethod: 'paypal',
            donor: req.user ? req.user.id : null,
            donorName: donorName,
            donorEmail: donorEmail,
            message: message,
            isAnonymous: isAnonymous,
            rewardTier: rewardTier,
            status: 'pending'
        });
        
        await donation.save();
        
        // Create PayPal payment URL
        const paypalUrl = process.env.NODE_ENV === 'production' 
            ? 'https://www.paypal.com/cgi-bin/webscr'
            : 'https://www.sandbox.paypal.com/cgi-bin/webscr';
        
        const params = new URLSearchParams({
            cmd: '_xclick',
            business: process.env.PAYPAL_EMAIL,
            item_name: `Donation for: ${fundingGoal.title}`,
            amount: amount.toFixed(2),
            currency_code: 'USD',
            custom: donation._id.toString(),
            return: `${process.env.CLIENT_URL}/donation/success?donation=${donation._id}`,
            cancel_return: `${process.env.CLIENT_URL}/donation/cancelled`,
            notify_url: `${process.env.SERVER_URL}/api/payments/paypal/ipn`,
            no_shipping: '1',
            no_note: '1'
        });
        
        const paymentUrl = `${paypalUrl}?${params.toString()}`;
        
        res.json({
            success: true,
            data: {
                paymentUrl: paymentUrl,
                donationId: donation._id
            }
        });
        
    } catch (error) {
        console.error('PayPal payment creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating PayPal payment',
            error: error.message
        });
    }
});

// PayPal IPN Handler
router.post('/paypal/ipn', express.urlencoded({extended: true}), async (req, res) => {
    try {
        // Verify IPN with PayPal
        const verifyUrl = process.env.NODE_ENV === 'production'
            ? 'https://www.paypal.com/cgi-bin/webscr'
            : 'https://www.sandbox.paypal.com/cgi-bin/webscr';
        
        const verifyParams = new URLSearchParams({
            cmd: '_notify-validate',
            ...req.body
        });
        
        const verifyResponse = await fetch(verifyUrl, {
            method: 'POST',
            body: verifyParams,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const verifyResult = await verifyResponse.text();
        
        if (verifyResult === 'VERIFIED') {
            const {
                payment_status,
                custom: donationId,
                txn_id,
                mc_gross: amount,
                payer_email
            } = req.body;
            
            if (payment_status === 'Completed') {
                await handlePayPalPaymentSuccess(donationId, txn_id, parseFloat(amount), payer_email);
            } else if (payment_status === 'Failed' || payment_status === 'Denied') {
                await handlePayPalPaymentFailure(donationId, payment_status);
            }
        } else {
            console.error('PayPal IPN verification failed');
        }
        
        res.status(200).send('OK');
        
    } catch (error) {
        console.error('PayPal IPN processing error:', error);
        res.status(500).send('Error');
    }
});

// Handle PayPal payment success
async function handlePayPalPaymentSuccess(donationId, transactionId, amount, payerEmail) {
    try {
        const donation = await Donation.findById(donationId);
        if (!donation) {
            console.error('Donation not found for PayPal payment:', donationId);
            return;
        }
        
        // Calculate PayPal processing fee (2.9% + $0.30)
        const processingFee = Math.round((amount * 0.029 + 0.30) * 100) / 100;
        
        // Update donation
        donation.status = 'completed';
        donation.transactionId = transactionId;
        donation.processingFee = processingFee;
        donation.processedAt = new Date();
        donation.paymentMetadata = new Map([
            ['payerEmail', payerEmail],
            ['processor', 'paypal']
        ]);
        
        await donation.save();
        
        // Update funding goal (same logic as Stripe)
        const fundingGoal = await FundingGoal.findById(donation.fundingGoal);
        if (fundingGoal) {
            fundingGoal.currentAmount += donation.amount;
            fundingGoal.stats.totalDonations += 1;
            
            const uniqueDonors = await Donation.distinct('donor', {
                fundingGoal: fundingGoal._id,
                status: 'completed',
                donor: { $ne: null }
            });
            fundingGoal.stats.uniqueDonors = uniqueDonors.length;
            
            fundingGoal.calculateAverageDonation();
            await fundingGoal.save();
            
            if (fundingGoal.isGoalReached() && fundingGoal.status === 'active') {
                await sendGoalReachedNotification(fundingGoal);
            }
        }
        
        await sendDonationThankYou(donation);
        console.log('PayPal payment processed successfully:', donation._id);
        
    } catch (error) {
        console.error('Error handling PayPal payment success:', error);
    }
}

// Handle PayPal payment failure
async function handlePayPalPaymentFailure(donationId, paymentStatus) {
    try {
        const donation = await Donation.findById(donationId);
        if (donation) {
            donation.status = 'failed';
            donation.failureReason = `PayPal payment ${paymentStatus.toLowerCase()}`;
            await donation.save();
        }
        
        console.log('PayPal payment failed:', donationId, paymentStatus);
        
    } catch (error) {
        console.error('Error handling PayPal payment failure:', error);
    }
}

// Get donation status
router.get('/donation/:id/status', async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('fundingGoal', 'title currentAmount targetAmount')
            .select('status amount createdAt processedAt failureReason');
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        
        res.json({
            success: true,
            data: donation
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donation status',
            error: error.message
        });
    }
});

// Notification functions (implement based on your email service)
async function sendGoalReachedNotification(fundingGoal) {
    try {
        const creator = await User.findById(fundingGoal.creator);
        if (creator) {
            // Send email notification to creator
            console.log(`Funding goal reached for ${fundingGoal.title} by ${creator.name}`);
            // Implement email sending logic here
        }
    } catch (error) {
        console.error('Error sending goal reached notification:', error);
    }
}

async function sendDonationThankYou(donation) {
    try {
        if (donation.donorEmail && !donation.isAnonymous) {
            // Send thank you email to donor
            console.log(`Sending thank you email to ${donation.donorEmail} for donation ${donation._id}`);
            // Implement email sending logic here
        }
    } catch (error) {
        console.error('Error sending donation thank you:', error);
    }
}

module.exports = router;

