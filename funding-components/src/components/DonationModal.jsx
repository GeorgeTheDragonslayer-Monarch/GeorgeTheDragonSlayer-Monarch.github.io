import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import RewardTiers from './RewardTiers';
import { formatCurrency } from '@utils/formatCurrency';

// Initialize Stripe
const stripePromise = loadStripe(window.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const DonationModal = ({ goal, onClose, onSuccess }) => {
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedTier, setSelectedTier] = useState(null);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
    isAnonymous: false
  });
  const [currentStep, setCurrentStep] = useState('amount'); // amount, payment, success
  const [isProcessing, setIsProcessing] = useState(false);

  const presetAmounts = [5, 10, 25, 50, 100];

  useEffect(() => {
    // Auto-select reward tier based on amount
    if (goal.rewardTiers && goal.rewardTiers.length > 0) {
      const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
      const availableTier = goal.rewardTiers
        .filter(tier => amount >= tier.amount && (!tier.maxBackers || tier.currentBackers < tier.maxBackers))
        .sort((a, b) => b.amount - a.amount)[0];
      
      setSelectedTier(availableTier || null);
    }
  }, [selectedAmount, customAmount, goal.rewardTiers]);

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(0);
    }
  };

  const getFinalAmount = () => {
    return customAmount ? parseFloat(customAmount) : selectedAmount;
  };

  const handleContinueToPayment = () => {
    const amount = getFinalAmount();
    if (amount < 1) {
      alert('Minimum donation amount is $1');
      return;
    }
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = (paymentResult) => {
    setCurrentStep('success');
    setIsProcessing(false);
    if (onSuccess) {
      onSuccess(paymentResult);
    }
  };

  const handlePaymentError = (error) => {
    setIsProcessing(false);
    alert('Payment failed: ' + error.message);
  };

  const handleBackToAmount = () => {
    setCurrentStep('amount');
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="donation-modal-overlay" onClick={handleModalClick}>
      <div className="donation-modal">
        <div className="modal-header">
          <h3>Support: {goal.title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {currentStep === 'amount' && (
            <div className="amount-selection">
              <div className="goal-summary">
                <div className="progress-info">
                  <span>{formatCurrency(goal.currentAmount)} raised</span>
                  <span>of {formatCurrency(goal.targetAmount)} goal</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="amount-options">
                <h4>Choose Amount</h4>
                <div className="preset-amounts">
                  {presetAmounts.map(amount => (
                    <button
                      key={amount}
                      className={`amount-btn ${selectedAmount === amount ? 'selected' : ''}`}
                      onClick={() => handleAmountSelect(amount)}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                <div className="custom-amount">
                  <label>Custom Amount</label>
                  <div className="amount-input">
                    <span className="currency-symbol">$</span>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
              </div>

              {goal.rewardTiers && goal.rewardTiers.length > 0 && (
                <RewardTiers
                  tiers={goal.rewardTiers}
                  selectedAmount={getFinalAmount()}
                  selectedTier={selectedTier}
                  onTierSelect={setSelectedTier}
                />
              )}

              <div className="donor-info">
                <h4>Your Information</h4>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={donorInfo.name}
                    onChange={(e) => setDonorInfo({...donorInfo, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={donorInfo.email}
                    onChange={(e) => setDonorInfo({...donorInfo, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <textarea
                    placeholder="Leave a message (optional)"
                    value={donorInfo.message}
                    onChange={(e) => setDonorInfo({...donorInfo, message: e.target.value})}
                    rows="3"
                  ></textarea>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={donorInfo.isAnonymous}
                      onChange={(e) => setDonorInfo({...donorInfo, isAnonymous: e.target.checked})}
                    />
                    Make this donation anonymous
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleContinueToPayment}
                  disabled={getFinalAmount() < 1}
                >
                  Continue to Payment - {formatCurrency(getFinalAmount())}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="payment-section">
              <div className="payment-summary">
                <h4>Payment Summary</h4>
                <div className="summary-line">
                  <span>Donation Amount:</span>
                  <span>{formatCurrency(getFinalAmount())}</span>
                </div>
                {selectedTier && (
                  <div className="summary-line">
                    <span>Reward Tier:</span>
                    <span>{selectedTier.title}</span>
                  </div>
                )}
                <div className="summary-line total">
                  <span>Total:</span>
                  <span>{formatCurrency(getFinalAmount())}</span>
                </div>
              </div>

              <Elements stripe={stripePromise}>
                <PaymentForm
                  amount={getFinalAmount()}
                  goalId={goal._id}
                  donorInfo={donorInfo}
                  selectedTier={selectedTier}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              </Elements>

              <div className="modal-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={handleBackToAmount}
                  disabled={isProcessing}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="success-section">
              <div className="success-message">
                <div className="success-icon">🎉</div>
                <h4>Thank You!</h4>
                <p>Your donation of {formatCurrency(getFinalAmount())} has been processed successfully.</p>
                
                {selectedTier && (
                  <div className="reward-confirmation">
                    <h5>Your Reward</h5>
                    <div className="reward-details">
                      <strong>{selectedTier.title}</strong>
                      <p>{selectedTier.description}</p>
                    </div>
                  </div>
                )}

                <div className="next-steps">
                  <p>You will receive a confirmation email shortly with your receipt and reward details.</p>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-primary" onClick={onClose}>
                  Close
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `I just supported: ${goal.title}`,
                        text: `Help support this amazing project!`,
                        url: window.location.href
                      });
                    }
                  }}
                >
                  Share
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationModal;

