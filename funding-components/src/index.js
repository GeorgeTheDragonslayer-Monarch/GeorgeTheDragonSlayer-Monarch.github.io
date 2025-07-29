/**
 * Main entry point for Dreams Uncharted Funding Components
 * This file exports all components for use in HTML pages
 */

import React from 'react';
import ReactDOM from 'react-dom';

// Import all components
import FundingGoalCard from './components/FundingGoalCard';
import DonationModal from './components/DonationModal';
import PaymentForm from './components/PaymentForm';
import ProgressBar from './components/ProgressBar';
import RewardTiers from './components/RewardTiers';

// Import embed components
import FundingGoalsEmbed from './embeds/FundingGoalsEmbed';
import AdminFundingEmbed from './embeds/AdminFundingEmbed';
import DonationButtonEmbed from './embeds/DonationButtonEmbed';
import CreateFundingGoalEmbed from './embeds/CreateFundingGoalEmbed';

// Import hooks and utilities
import * as fundingHooks from './hooks/useFunding';
import * as fundingAPI from './services/fundingAPI';
import * as currencyUtils from './utils/formatCurrency';

// Import styles
import './styles/funding-components.css';

// Main components for direct use
export {
  FundingGoalCard,
  DonationModal,
  PaymentForm,
  ProgressBar,
  RewardTiers
};

// Embed components for HTML integration
export {
  FundingGoalsEmbed,
  AdminFundingEmbed,
  DonationButtonEmbed,
  CreateFundingGoalEmbed
};

// Utilities
export {
  fundingHooks,
  fundingAPI,
  currencyUtils
};

// Global object for HTML script tag usage
if (typeof window !== 'undefined') {
  window.FundingComponents = {
    // Main components
    FundingGoalCard,
    DonationModal,
    PaymentForm,
    ProgressBar,
    RewardTiers,
    
    // Embed components (most commonly used)
    FundingGoalsEmbed,
    AdminFundingEmbed,
    DonationButtonEmbed,
    CreateFundingGoalEmbed,
    
    // Utilities
    hooks: fundingHooks,
    api: fundingAPI,
    utils: currencyUtils,
    
    // Helper functions for HTML integration
    renderFundingGoals: (containerId, props = {}) => {
      const container = document.getElementById(containerId);
      if (container) {
        ReactDOM.render(React.createElement(FundingGoalsEmbed, props), container);
      }
    },
    
    renderDonationButton: (containerId, props = {}) => {
      const container = document.getElementById(containerId);
      if (container) {
        ReactDOM.render(React.createElement(DonationButtonEmbed, props), container);
      }
    },
    
    renderAdminFunding: (containerId, props = {}) => {
      const container = document.getElementById(containerId);
      if (container) {
        ReactDOM.render(React.createElement(AdminFundingEmbed, props), container);
      }
    },
    
    renderCreateFundingGoal: (containerId, props = {}) => {
      const container = document.getElementById(containerId);
      if (container) {
        ReactDOM.render(React.createElement(CreateFundingGoalEmbed, props), container);
      }
    },
    
    // Cleanup function
    unmount: (containerId) => {
      const container = document.getElementById(containerId);
      if (container) {
        ReactDOM.unmountComponentAtNode(container);
      }
    }
  };
  
  // Auto-initialize components with data attributes
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-render funding goals
    document.querySelectorAll('[data-funding-goals]').forEach(element => {
      const props = {
        seriesId: element.dataset.seriesId,
        limit: parseInt(element.dataset.limit) || 3,
        showAll: element.dataset.showAll === 'true'
      };
      ReactDOM.render(React.createElement(FundingGoalsEmbed, props), element);
    });
    
    // Auto-render donation buttons
    document.querySelectorAll('[data-donation-button]').forEach(element => {
      const props = {
        goalId: element.dataset.goalId,
        buttonText: element.dataset.buttonText || 'Support This Goal',
        className: element.dataset.className || ''
      };
      ReactDOM.render(React.createElement(DonationButtonEmbed, props), element);
    });
    
    // Auto-render admin funding
    document.querySelectorAll('[data-admin-funding]').forEach(element => {
      const props = {
        creatorId: element.dataset.creatorId
      };
      ReactDOM.render(React.createElement(AdminFundingEmbed, props), element);
    });
  });
}

