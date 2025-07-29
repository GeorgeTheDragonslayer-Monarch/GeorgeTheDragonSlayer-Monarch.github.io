import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import FundingGoalCard from '../components/FundingGoalCard';
import DonationModal from '../components/DonationModal';
import { useFundingGoals, useSeriesFundingGoals } from '../hooks/useFunding';

const stripePromise = loadStripe(window.STRIPE_PUBLISHABLE_KEY);

const FundingGoalsEmbed = ({ seriesId, limit = 3, showAll = false }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // Use appropriate hook based on props
  const { data, isLoading, error } = seriesId 
    ? useSeriesFundingGoals(seriesId)
    : useFundingGoals({ limit, status: 'active' });

  if (isLoading) return <div className="funding-loading">Loading funding goals...</div>;
  if (error) return <div className="funding-error">Unable to load funding goals</div>;

  const goals = seriesId ? data?.data : data?.data?.goals;
  if (!goals || goals.length === 0) return null;

  const handleSupportClick = (goal) => {
    setSelectedGoal(goal);
    setShowDonationModal(true);
  };

  return (
    <div className="funding-goals-embed">
      <div className="funding-header">
        <h3>Support This {seriesId ? 'Series' : 'Creator'}</h3>
        <p>Help fund new chapters and episodes</p>
      </div>
      
      <div className="funding-goals-grid">
        {goals.slice(0, showAll ? goals.length : limit).map(goal => (
          <FundingGoalCard 
            key={goal._id} 
            goal={goal} 
            onSupportClick={() => handleSupportClick(goal)}
            compact={true}
          />
        ))}
      </div>

      {goals.length > limit && !showAll && (
        <div className="funding-view-all">
          <a href="/funding" className="btn btn-secondary">
            View All Funding Goals
          </a>
        </div>
      )}

      {showDonationModal && selectedGoal && (
        <Elements stripe={stripePromise}>
          <DonationModal
            isOpen={showDonationModal}
            onClose={() => setShowDonationModal(false)}
            fundingGoal={selectedGoal}
            user={window.currentUser}
          />
        </Elements>
      )}
    </div>
  );
};

export default FundingGoalsEmbed;

