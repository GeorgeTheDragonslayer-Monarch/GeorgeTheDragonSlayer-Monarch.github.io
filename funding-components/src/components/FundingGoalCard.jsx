import React, { useState } from 'react';
import { formatCurrency } from '@utils/formatCurrency';
import ProgressBar from './ProgressBar';
import DonationModal from './DonationModal';

const FundingGoalCard = ({ goal, showDonateButton = true, compact = false }) => {
  const [showDonationModal, setShowDonationModal] = useState(false);

  const progressPercentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const isCompleted = goal.status === 'completed' || progressPercentage >= 100;
  const daysLeft = goal.deadline ? Math.max(0, Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))) : null;

  const handleDonateClick = () => {
    setShowDonationModal(true);
  };

  const handleCloseModal = () => {
    setShowDonationModal(false);
  };

  if (compact) {
    return (
      <div className="funding-goal-card compact">
        <div className="goal-header">
          <h4>{goal.title}</h4>
          <span className={`goal-status ${goal.status}`}>
            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
          </span>
        </div>
        <ProgressBar 
          current={goal.currentAmount} 
          target={goal.targetAmount}
          showPercentage={true}
        />
        <div className="goal-summary">
          {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
          {!isCompleted && showDonateButton && (
            <button 
              className="btn btn-primary btn-small"
              onClick={handleDonateClick}
            >
              Support
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="funding-goal-card">
        <div className="goal-header">
          <div>
            <h4>{goal.title}</h4>
            <p className="goal-type">{goal.fundingType.replace('-', ' ')}</p>
          </div>
          <div className="goal-meta">
            <span className={`goal-status ${goal.status}`}>
              {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
            </span>
            {daysLeft !== null && daysLeft > 0 && (
              <span className="days-left">{daysLeft} days left</span>
            )}
          </div>
        </div>

        {goal.description && (
          <p className="goal-description">{goal.description}</p>
        )}

        <div className="goal-progress">
          <ProgressBar 
            current={goal.currentAmount} 
            target={goal.targetAmount}
            showPercentage={true}
          />
          <div className="progress-details">
            <span className="amount-raised">
              {formatCurrency(goal.currentAmount)} raised
            </span>
            <span className="amount-target">
              of {formatCurrency(goal.targetAmount)} goal
            </span>
          </div>
          {goal.stats && (
            <div className="goal-stats">
              <span>{goal.stats.totalDonations || 0} supporters</span>
              {goal.stats.averageDonation && (
                <span>Avg: {formatCurrency(goal.stats.averageDonation)}</span>
              )}
            </div>
          )}
        </div>

        {goal.rewardTiers && goal.rewardTiers.length > 0 && (
          <div className="reward-preview">
            <h5>Rewards Available</h5>
            <div className="reward-tiers-preview">
              {goal.rewardTiers.slice(0, 3).map((tier, index) => (
                <div key={index} className="reward-tier-preview">
                  <span className="tier-amount">{formatCurrency(tier.amount)}</span>
                  <span className="tier-title">{tier.title}</span>
                </div>
              ))}
              {goal.rewardTiers.length > 3 && (
                <span className="more-rewards">+{goal.rewardTiers.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {!isCompleted && showDonateButton && (
          <div className="goal-actions">
            <button 
              className="btn btn-primary btn-large"
              onClick={handleDonateClick}
            >
              Support This Goal
            </button>
            <div className="goal-share">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: goal.title,
                      text: `Help support: ${goal.title}`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
              >
                Share
              </button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="goal-completed">
            <div className="completion-message">
              <h5>🎉 Goal Completed!</h5>
              <p>Thank you to all {goal.stats?.totalDonations || 0} supporters who made this possible!</p>
            </div>
          </div>
        )}
      </div>

      {showDonationModal && (
        <DonationModal
          goal={goal}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default FundingGoalCard;

