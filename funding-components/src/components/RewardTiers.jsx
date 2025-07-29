import React from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import './RewardTiers.css';

const RewardTiers = ({ tiers, selectedAmount, selectedReward, onRewardSelect }) => {
  return (
    <div className="reward-tiers">
      <h3>Choose your reward</h3>
      <div className="tiers-list">
        {tiers.map((tier, index) => {
          const isEligible = selectedAmount >= tier.amount;
          const isSelected = selectedReward && selectedReward.amount === tier.amount;
          const isAvailable = !tier.maxBackers || tier.currentBackers < tier.maxBackers;
          
          return (
            <div
              key={index}
              className={`reward-tier ${isSelected ? 'selected' : ''} ${!isEligible ? 'disabled' : ''} ${!isAvailable ? 'unavailable' : ''}`}
              onClick={() => isEligible && isAvailable && onRewardSelect(tier)}
            >
              <div className="tier-header">
                <span className="tier-amount">{formatCurrency(tier.amount)}</span>
                {tier.maxBackers && (
                  <span className="tier-availability">
                    {tier.currentBackers || 0}/{tier.maxBackers} claimed
                  </span>
                )}
              </div>
              
              <h4 className="tier-title">{tier.title}</h4>
              <p className="tier-description">{tier.description}</p>
              
              {!isEligible && (
                <div className="tier-requirement">
                  Requires {formatCurrency(tier.amount)} or more
                </div>
              )}
              
              {!isAvailable && (
                <div className="tier-unavailable">
                  No longer available
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RewardTiers;

