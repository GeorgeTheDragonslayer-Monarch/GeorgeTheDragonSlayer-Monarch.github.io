import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { formatCurrency } from '../../utils/formatCurrency';
import './FundingGoalCard.css';

const FundingGoalCard = ({ goal, showCreator = true }) => {
  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
  const timeRemaining = goal.deadline ? getTimeRemaining(goal.deadline) : null;
  
  return (
    <div className="funding-goal-card">
      <div className="goal-header">
        {goal.contentId?.featuredImage && (
          <div className="goal-image">
            <img 
              src={goal.contentId.featuredImage} 
              alt={goal.title}
              loading="lazy"
            />
          </div>
        )}
        
        <div className="goal-content">
          <div className="goal-meta">
            <span className={`goal-type ${goal.fundingType}`}>
              {goal.fundingType.replace('-', ' ')}
            </span>
            <span className={`goal-status ${goal.status}`}>
              {goal.status}
            </span>
          </div>
          
          <h3 className="goal-title">
            <Link to={`/funding/goals/${goal._id}`}>
              {goal.title}
            </Link>
          </h3>
          
          <p className="goal-description">
            {goal.description.length > 120 
              ? `${goal.description.substring(0, 120)}...`
              : goal.description
            }
          </p>
          
          {showCreator && goal.creator && (
            <div className="goal-creator">
              <img 
                src={goal.creator.avatar || '/default-avatar.png'} 
                alt={goal.creator.name}
                className="creator-avatar"
              />
              <span className="creator-name">
                by {goal.creator.name}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="goal-progress">
        <ProgressBar 
          current={goal.currentAmount} 
          target={goal.targetAmount}
          showPercentage={true}
        />
        
        <div className="progress-stats">
          <div className="funding-amounts">
            <span className="current-amount">
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className="target-amount">
              of {formatCurrency(goal.targetAmount)} goal
            </span>
          </div>
          
          <div className="funding-meta">
            <span className="completion-percentage">
              {Math.round(progressPercentage)}% funded
            </span>
            {goal.stats?.totalDonations > 0 && (
              <span className="donor-count">
                {goal.stats.totalDonations} donation{goal.stats.totalDonations !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        {timeRemaining && !timeRemaining.expired && (
          <div className="time-remaining">
            <span className="time-label">Time remaining:</span>
            <span className="time-value">
              {timeRemaining.days > 0 && `${timeRemaining.days}d `}
              {timeRemaining.hours > 0 && `${timeRemaining.hours}h `}
              {timeRemaining.minutes}m
            </span>
          </div>
        )}
        
        {timeRemaining?.expired && (
          <div className="time-expired">
            Campaign ended
          </div>
        )}
      </div>
      
      <div className="goal-actions">
        <Link 
          to={`/funding/goals/${goal._id}`}
          className="btn btn-primary"
        >
          {goal.status === 'completed' ? 'View Details' : 'Support This Goal'}
        </Link>
        
        {goal.seriesId && (
          <Link 
            to={`/series/${goal.seriesId.slug}`}
            className="btn btn-secondary"
          >
            View Series
          </Link>
        )}
      </div>
      
      {goal.rewardTiers && goal.rewardTiers.length > 0 && (
        <div className="reward-preview">
          <span className="reward-label">Rewards starting at:</span>
          <span className="reward-amount">
            {formatCurrency(Math.min(...goal.rewardTiers.map(tier => tier.amount)))}
          </span>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate time remaining
const getTimeRemaining = (deadline) => {
  const now = new Date();
  const timeLeft = new Date(deadline) - now;
  
  if (timeLeft <= 0) return { expired: true };
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes, expired: false };
};

export default FundingGoalCard;

