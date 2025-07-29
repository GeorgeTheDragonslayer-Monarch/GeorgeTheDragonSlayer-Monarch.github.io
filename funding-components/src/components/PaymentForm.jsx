import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from '@stripe/react-stripe-js';
import { formatCurrency } from '../../utils/formatCurrency';
import './PaymentForm.css';

const PaymentForm = ({
  fundingGoal,
  amount,
  donorInfo,
  selectedReward,
  onSuccess,
  onBack
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  const splitCardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/payments/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fundingGoalId: fundingGoal._id,
          amount: amount,
          currency: 'usd',
          donorName: donorInfo.name,
          donorEmail: donorInfo.email,
          message: donorInfo.message,
          isAnonymous: donorInfo.isAnonymous,
          rewardTier: selectedReward
        }),
      });

      const { success, data, message } = await response.json();

      if (!success) {
        throw new Error(message || 'Failed to create payment intent');
      }

      const { clientSecret } = data;

      // Get card element
      const cardElement = paymentMethod === 'card' 
        ? elements.getElement(CardElement)
        : elements.getElement(CardNumberElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: donorInfo.name,
              email: donorInfo.email,
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        throw new Error('Payment was not successful');
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred while processing your payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-form">
      <div className="payment-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h3>Complete Your Donation</h3>
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <div className="summary-item">
          <span>Donation to: {fundingGoal.title}</span>
          <span>{formatCurrency(amount)}</span>
        </div>
        
        {selectedReward && (
          <div className="summary-item reward">
            <span>Reward: {selectedReward.title}</span>
            <span>Included</span>
          </div>
        )}
        
        <div className="summary-total">
          <span>Total</span>
          <span>{formatCurrency(amount)}</span>
        </div>
      </div>

      {/* Payment Method Toggle */}
      <div className="payment-method-toggle">
        <button
          type="button"
          className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('card')}
        >
          Single Card Element
        </button>
        <button
          type="button"
          className={`method-btn ${paymentMethod === 'split' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('split')}
        >
          Split Card Elements
        </button>
      </div>

      <form onSubmit={handleSubmit} className="stripe-form">
        {/* Donor Information Display */}
        <div className="donor-summary">
          <h4>Donor Information</h4>
          <p><strong>Name:</strong> {donorInfo.name}</p>
          <p><strong>Email:</strong> {donorInfo.email}</p>
          {donorInfo.message && (
            <p><strong>Message:</strong> {donorInfo.message}</p>
          )}
          {donorInfo.isAnonymous && (
            <p className="anonymous-note">This donation will be anonymous</p>
          )}
        </div>

        {/* Card Information */}
        <div className="card-section">
          <h4>Payment Information</h4>
          
          {paymentMethod === 'card' ? (
            <div className="form-group">
              <label htmlFor="card-element">Card details</label>
              <div className="card-element-container">
                <CardElement
                  id="card-element"
                  options={cardElementOptions}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="card-number">Card number</label>
                <div className="card-element-container">
                  <CardNumberElement
                    id="card-number"
                    options={splitCardElementOptions}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="card-expiry">Expiry date</label>
                  <div className="card-element-container">
                    <CardExpiryElement
                      id="card-expiry"
                      options={splitCardElementOptions}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="card-cvc">CVC</label>
                  <div className="card-element-container">
                    <CardCvcElement
                      id="card-cvc"
                      options={splitCardElementOptions}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Security Notice */}
        <div className="security-notice">
          <div className="security-icons">
            🔒 <span>Secured by Stripe</span>
          </div>
          <p>Your payment information is encrypted and secure. We never store your card details.</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            `Donate ${formatCurrency(amount)}`
          )}
        </button>
      </form>

      {/* Terms */}
      <div className="payment-terms">
        <p>
          By completing this donation, you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;

