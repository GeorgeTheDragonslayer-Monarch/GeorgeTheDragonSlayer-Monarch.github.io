import React from 'react';
import { formatCurrency } from '@utils/formatCurrency';

const RewardTiers = ({ 
  tiers, 
  selectedAmount, 
  selectedTier, 
  onTierSelect,
  showUnavailable = true 
}) => {
  if (!tiers || tiers.length === 0) {
    return null;
  }

  const handleTierClick = (tier) => {
    const isAvailable = selectedAmount >= tier.amount && 
                       (!tier.maxBackers || tier.currentBackers < tier.maxBackers);
    
    if (isAvailable && onTierSelect) {
      onTierSelect(tier);
    }
  };

  return (
    <div className="reward-tiers">
      <h4>Reward Tiers</h4>
      <div className="tiers-list">
        {tiers.map((tier, index) => {
          const isEligible = selectedAmount >= tier.amount;
          const isAvailable = !tier.maxBackers || tier.currentBackers < tier.maxBackers;
          const isSelected = selectedTier && selectedTier.amount === tier.amount;
          const canSelect = isEligible && isAvailable;

          if (!showUnavailable && !canSelect) {
            return null;
          }

          return (
            <div
              key={index}
              className={`reward-tier ${
                isSelected ? 'selected' : ''
              } ${
                canSelect ? 'available' : 'unavailable'
              } ${
                !isEligible ? 'insufficient-amount' : ''
              }`}
              onClick={() => handleTierClick(tier)}
              style={{ cursor: canSelect ? 'pointer' : 'default' }}
            >
              <div className="tier-header">
                <span className="tier-amount">
                  {formatCurrency(tier.amount)}
                </span>
                {tier.maxBackers && (
                  <span className="tier-availability">
                    {tier.currentBackers || 0} / {tier.maxBackers} claimed
                  </span>
                )}
              </div>
              
              <h5 className="tier-title">{tier.title}</h5>
              
              {tier.description && (
                <p className="tier-description">{tier.description}</p>
              )}

              {!isEligible && (
                <div className="tier-requirement">
                  Requires minimum donation of {formatCurrency(tier.amount)}
                </div>
              )}

              {isEligible && !isAvailable && (
                <div className="tier-unavailable">
                  This reward tier is no longer available
                </div>
              )}

              {isSelected && (
                <div className="tier-selected-indicator">
                  ✓ Selected
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {selectedAmount > 0 && !tiers.some(tier => selectedAmount >= tier.amount && (!tier.maxBackers || tier.currentBackers < tier.maxBackers)) && (
        <div className="no-rewards-available">
          <p>No reward tiers available for this amount, but your support is still greatly appreciated!</p>
        </div>
      )}
    </div>
  );
};

export default RewardTiers;

