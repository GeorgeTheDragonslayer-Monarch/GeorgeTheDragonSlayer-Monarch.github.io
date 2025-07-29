import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import RewardTiers from './RewardTiers';
import { formatCurrency } from '../../utils/formatCurrency';
import './DonationModal.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const DonationModal = ({ 
  isOpen, 
  onClose, 
  fundingGoal, 
  user 
}) => {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedReward, setSelectedReward] = useState(null);
  const [donorInfo, setDonorInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
    isAnonymous: false
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Preset donation amounts
  const presetAmounts = [5, 10, 25, 50, 100];

  useEffect(() => {
    if (user) {
      setDonorInfo(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    
    // Auto-select appropriate reward tier
    if (fundingGoal.rewardTiers) {
      const eligibleRewards = fundingGoal.rewardTiers
        .filter(tier => amount >= tier.amount)
        .sort((a, b) => b.amount - a.amount);
      
      if (eligibleRewards.length > 0) {
        setSelectedReward(eligibleRewards[0]);
      }
    }
  };

  const handleCustomAmountChange = (e) => {
    const amount = parseFloat(e.target.value);
    setCustomAmount(e.target.value);
    setSelectedAmount(amount);
    
    // Update reward tier based on custom amount
    if (fundingGoal.rewardTiers && amount) {
      const eligibleRewards = fundingGoal.rewardTiers
        .filter(tier => amount >= tier.amount)
        .sort((a, b) => b.amount - a.amount);
      
      setSelectedReward(eligibleRewards.length > 0 ? eligibleRewards[0] : null);
    }
  };

  const handleRewardSelect = (reward) => {
    setSelectedReward(reward);
    if (reward && (!selectedAmount || selectedAmount < reward.amount)) {
      setSelectedAmount(reward.amount);
      setCustomAmount(reward.amount.toString());
    }
  };

  const handleDonorInfoChange = (field, value) => {
    setDonorInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProceedToPayment = () => {
    if (!selectedAmount || selectedAmount < 1) {
      alert('Please select a donation amount of at least $1');
      return;
    }
    
    if (!donorInfo.name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!donorInfo.email.trim()) {
      alert('Please enter your email');
      return;
    }
    
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    onClose();
    // Redirect to success page or show success message
    window.location.href = `/donation/success`;
  };

  const handlePayPalPayment = async () => {
    try {
      const response = await fetch('/api/payments/paypal/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fundingGoalId: fundingGoal._id,
          amount: selectedAmount,
          donorName: donorInfo.name,
          donorEmail: donorInfo.email,
          message: donorInfo.message,
          isAnonymous: donorInfo.isAnonymous,
          rewardTier: selectedReward
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.data.paymentUrl;
      } else {
        alert('Error creating PayPal payment: ' + data.message);
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      alert('Error processing PayPal payment');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="donation-modal-overlay" onClick={onClose}>
      <div className="donation-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Support {fundingGoal.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {!showPaymentForm ? (
            <>
              {/* Goal Summary */}
              <div className="goal-summary">
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${Math.min((fundingGoal.currentAmount / fundingGoal.targetAmount) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <div className="progress-text">
                    {formatCurrency(fundingGoal.currentAmount)} of {formatCurrency(fundingGoal.targetAmount)} goal
                  </div>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="amount-selection">
                <h3>Choose your support amount</h3>
                <div className="preset-amounts">
                  {presetAmounts.map(amount => (
                    <button
                      key={amount}
                      className={`amount-btn ${selectedAmount === amount ? 'selected' : ''}`}
                      onClick={() => handleAmountSelect(amount)}
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
                
                <div className="custom-amount">
                  <label htmlFor="custom-amount">Custom amount:</label>
                  <div className="amount-input">
                    <span className="currency-symbol">$</span>
                    <input
                      id="custom-amount"
                      type="number"
                      min="1"
                      step="0.01"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
              </div>

              {/* Reward Tiers */}
              {fundingGoal.rewardTiers && fundingGoal.rewardTiers.length > 0 && (
                <RewardTiers
                  tiers={fundingGoal.rewardTiers}
                  selectedAmount={selectedAmount}
                  selectedReward={selectedReward}
                  onRewardSelect={handleRewardSelect}
                />
              )}

              {/* Donor Information */}
              <div className="donor-info">
                <h3>Your information</h3>
                <div className="form-group">
                  <label htmlFor="donor-name">Name *</label>
                  <input
                    id="donor-name"
                    type="text"
                    value={donorInfo.name}
                    onChange={(e) => handleDonorInfoChange('name', e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="donor-email">Email *</label>
                  <input
                    id="donor-email"
                    type="email"
                    value={donorInfo.email}
                    onChange={(e) => handleDonorInfoChange('email', e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="donor-message">Message (optional)</label>
                  <textarea
                    id="donor-message"
                    value={donorInfo.message}
                    onChange={(e) => handleDonorInfoChange('message', e.target.value)}
                    placeholder="Leave a message for the creator..."
                    maxLength={500}
                    rows={3}
                  />
                  <small>{donorInfo.message.length}/500 characters</small>
                </div>
                
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={donorInfo.isAnonymous}
                      onChange={(e) => handleDonorInfoChange('isAnonymous', e.target.checked)}
                    />
                    Make this donation anonymous
                  </label>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="payment-method-selection">
                <h3>Payment method</h3>
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-info">
                      <strong>Credit/Debit Card</strong>
                      <small>Secure payment via Stripe</small>
                    </span>
                  </label>
                  
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-info">
                      <strong>PayPal</strong>
                      <small>Pay with your PayPal account</small>
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                
                {paymentMethod === 'stripe' ? (
                  <button 
                    className="btn btn-primary"
                    onClick={handleProceedToPayment}
                    disabled={!selectedAmount || selectedAmount < 1}
                  >
                    Continue to Payment
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={handlePayPalPayment}
                    disabled={!selectedAmount || selectedAmount < 1}
                  >
                    Pay with PayPal
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Payment Form */
            <Elements stripe={stripePromise}>
              <PaymentForm
                fundingGoal={fundingGoal}
                amount={selectedAmount}
                donorInfo={donorInfo}
                selectedReward={selectedReward}
                onSuccess={handlePaymentSuccess}
                onBack={() => setShowPaymentForm(false)}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationModal;

