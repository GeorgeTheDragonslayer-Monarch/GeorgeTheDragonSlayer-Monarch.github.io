import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { formatCurrency } from '@utils/formatCurrency';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      backgroundColor: '#16213e',
      '::placeholder': {
        color: '#b0b0b0',
      },
    },
    invalid: {
      color: '#f44336',
      iconColor: '#f44336',
    },
  },
  hidePostalCode: false,
};

const PaymentForm = ({ 
  amount, 
  goalId, 
  donorInfo, 
  selectedTier, 
  onSuccess, 
  onError, 
  isProcessing, 
  setIsProcessing 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    if (paymentMethod === 'stripe') {
      await handleStripePayment();
    } else if (paymentMethod === 'paypal') {
      await handlePayPalPayment();
    }
  };

  const handleStripePayment = async () => {
    const cardElement = elements.getElement(CardElement);

    try {
      // Create payment intent
      const response = await fetch('/api/payments/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          goalId,
          donorInfo,
          selectedTier,
        }),
      });

      const { clientSecret, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: donorInfo.name,
            email: donorInfo.email,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess({
          paymentId: paymentIntent.id,
          amount: amount,
          method: 'stripe',
        });
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      setCardError(error.message);
      onError(error);
    }
  };

  const handlePayPalPayment = async () => {
    try {
      // Create PayPal payment
      const response = await fetch('/api/payments/paypal/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          goalId,
          donorInfo,
          selectedTier,
        }),
      });

      const { approvalUrl, paymentId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to PayPal
      window.location.href = approvalUrl;
    } catch (error) {
      console.error('PayPal payment error:', error);
      onError(error);
    }
  };

  const handleCardChange = (event) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-methods">
        <h4>Payment Method</h4>
        <div className="payment-method-options">
          <label className={`payment-method-option ${paymentMethod === 'stripe' ? 'selected' : ''}`}>
            <input
              type="radio"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className="payment-method-info">
              <span className="payment-method-name">Credit/Debit Card</span>
              <span className="payment-method-description">Visa, Mastercard, American Express</span>
            </div>
            <div className="payment-method-logos">
              💳
            </div>
          </label>

          <label className={`payment-method-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
            <input
              type="radio"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className="payment-method-info">
              <span className="payment-method-name">PayPal</span>
              <span className="payment-method-description">Pay with your PayPal account</span>
            </div>
            <div className="payment-method-logos">
              🅿️
            </div>
          </label>
        </div>
      </div>

      {paymentMethod === 'stripe' && (
        <div className="stripe-payment">
          <div className="form-group">
            <label>Card Information</label>
            <div className="card-element-container">
              <CardElement
                options={CARD_ELEMENT_OPTIONS}
                onChange={handleCardChange}
              />
            </div>
            {cardError && (
              <div className="card-error">{cardError}</div>
            )}
          </div>

          <div className="security-info">
            <div className="security-badges">
              <span className="security-badge">🔒 SSL Secured</span>
              <span className="security-badge">🛡️ PCI Compliant</span>
            </div>
            <p className="security-text">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      )}

      {paymentMethod === 'paypal' && (
        <div className="paypal-payment">
          <div className="paypal-info">
            <p>You will be redirected to PayPal to complete your payment securely.</p>
            <div className="paypal-benefits">
              <span>✓ Buyer Protection</span>
              <span>✓ Secure Payment</span>
              <span>✓ No card details required</span>
            </div>
          </div>
        </div>
      )}

      <div className="payment-summary">
        <div className="summary-row">
          <span>Donation Amount:</span>
          <span>{formatCurrency(amount)}</span>
        </div>
        {selectedTier && (
          <div className="summary-row">
            <span>Reward Tier:</span>
            <span>{selectedTier.title}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>Total:</span>
          <span>{formatCurrency(amount)}</span>
        </div>
        <div className="processing-fee-note">
          <small>Processing fees are covered by Dreams Uncharted</small>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-large payment-submit"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <span>
            <span className="spinner"></span>
            Processing...
          </span>
        ) : (
          `Donate ${formatCurrency(amount)}`
        )}
      </button>

      <div className="payment-footer">
        <p className="terms-text">
          By completing this donation, you agree to our{' '}
          <a href="/terms" target="_blank">Terms of Service</a> and{' '}
          <a href="/privacy" target="_blank">Privacy Policy</a>.
        </p>
      </div>
    </form>
  );
};

export default PaymentForm;

