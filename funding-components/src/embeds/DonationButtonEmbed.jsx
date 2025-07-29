import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import DonationModal from '../components/DonationModal';
import { useFundingGoal } from '../hooks/useFunding';

const stripePromise = loadStripe(window.STRIPE_PUBLISHABLE_KEY);

const DonationButtonEmbed = ({ goalId, buttonText = "Support This Goal", className = "" }) => {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading } = useFundingGoal(goalId);

  if (isLoading || !data?.goal) return null;

  const goal = data.goal;

  return (
    <>
      <button 
        className={`donation-button ${className}`}
        onClick={() => setShowModal(true)}
      >
        {buttonText}
      </button>

      {showModal && (
        <Elements stripe={stripePromise}>
          <DonationModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            fundingGoal={goal}
            user={window.currentUser}
          />
        </Elements>
      )}
    </>
  );
};

export default DonationButtonEmbed;

