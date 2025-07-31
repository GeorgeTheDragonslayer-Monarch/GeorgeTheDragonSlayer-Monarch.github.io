/**
 * Dreams Uncharted Funding Components - HTML Embed Helper
 * This file provides easy integration functions for embedding React funding components
 * into existing HTML pages without requiring React knowledge.
 */

(function(window) {
  'use strict';

  // Ensure React and ReactDOM are available
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    console.error('Dreams Uncharted Funding: React and ReactDOM must be loaded before this script');
    return;
  }

  // Ensure FundingComponents are available
  if (typeof FundingComponents === 'undefined') {
    console.error('Dreams Uncharted Funding: funding-components.js must be loaded before this script');
    return;
  }

  // Global configuration
  window.DreamsUnchartedFunding = {
    // Configuration
    config: {
      stripePublishableKey: window.STRIPE_PUBLISHABLE_KEY || '',
      apiBaseUrl: window.API_BASE_URL || 'http://localhost:3001/api',
      currentUser: window.currentUser || null
    },

    // Easy embed functions
    embed: {
      /**
       * Embed funding goals for a series
       * @param {string} containerId - ID of the container element
       * @param {Object} options - Configuration options
       */
      fundingGoals: function(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
          console.error(`Container with ID "${containerId}" not found`);
          return;
        }

        const props = {
          seriesId: options.seriesId || null,
          limit: options.limit || 3,
          showAll: options.showAll || false
        };

        ReactDOM.render(
          React.createElement(FundingComponents.FundingGoalsEmbed, props),
          container
        );
      },

      /**
       * Embed a simple donation button
       * @param {string} containerId - ID of the container element
       * @param {Object} options - Configuration options
       */
      donationButton: function(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
          console.error(`Container with ID "${containerId}" not found`);
          return;
        }

        const props = {
          goalId: options.goalId,
          buttonText: options.buttonText || 'Support This Goal',
          className: options.className || ''
        };

        ReactDOM.render(
          React.createElement(FundingComponents.DonationButtonEmbed, props),
          container
        );
      },

      /**
       * Embed admin funding management
       * @param {string} containerId - ID of the container element
       * @param {Object} options - Configuration options
       */
      adminFunding: function(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
          console.error(`Container with ID "${containerId}" not found`);
          return;
        }

        const props = {
          creatorId: options.creatorId || (window.currentUser && window.currentUser.id)
        };

        ReactDOM.render(
          React.createElement(FundingComponents.AdminFundingEmbed, props),
          container
        );
      },

      /**
       * Embed create funding goal form
       * @param {string} containerId - ID of the container element
       * @param {Object} options - Configuration options
       */
      createFundingGoal: function(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
          console.error(`Container with ID "${containerId}" not found`);
          return;
        }

        const props = {
          creatorId: options.creatorId || (window.currentUser && window.currentUser.id),
          onSuccess: options.onSuccess || function(goal) {
            console.log('Funding goal created:', goal);
            if (options.redirectOnSuccess) {
              window.location.href = options.redirectOnSuccess;
            }
          }
        };

        ReactDOM.render(
          React.createElement(FundingComponents.CreateFundingGoalEmbed, props),
          container
        );
      }
    },

    // Utility functions
    utils: {
      /**
       * Format currency for display
       * @param {number} amount - Amount to format
       * @param {string} currency - Currency code (default: USD)
       */
      formatCurrency: function(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency
        }).format(amount);
      },

      /**
       * Calculate funding progress percentage
       * @param {number} current - Current amount raised
       * @param {number} target - Target amount
       */
      calculateProgress: function(current, target) {
        return target > 0 ? Math.min((current / target) * 100, 100) : 0;
      },

      /**
       * Check if user is authenticated
       */
      isAuthenticated: function() {
        return window.currentUser && window.currentUser.id;
      },

      /**
       * Check if user has specific role
       * @param {string} role - Role to check (user, creator, admin)
       */
      hasRole: function(role) {
        return window.currentUser && window.currentUser.role === role;
      },

      /**
       * Unmount component from container
       * @param {string} containerId - ID of the container element
       */
      unmount: function(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
          ReactDOM.unmountComponentAtNode(container);
        }
      }
    },

    // Auto-initialization functions
    init: {
      /**
       * Auto-initialize all funding components on page load
       */
      autoInit: function() {
        // Initialize funding goals
        document.querySelectorAll('[data-funding-goals]').forEach(function(element) {
          const props = {
            seriesId: element.dataset.seriesId,
            limit: parseInt(element.dataset.limit) || 3,
            showAll: element.dataset.showAll === 'true'
          };
          
          ReactDOM.render(
            React.createElement(FundingComponents.FundingGoalsEmbed, props),
            element
          );
        });

        // Initialize donation buttons
        document.querySelectorAll('[data-donation-button]').forEach(function(element) {
          const props = {
            goalId: element.dataset.goalId,
            buttonText: element.dataset.buttonText || 'Support This Goal',
            className: element.dataset.className || ''
          };
          
          ReactDOM.render(
            React.createElement(FundingComponents.DonationButtonEmbed, props),
            element
          );
        });

        // Initialize admin funding
        document.querySelectorAll('[data-admin-funding]').forEach(function(element) {
          const props = {
            creatorId: element.dataset.creatorId || (window.currentUser && window.currentUser.id)
          };
          
          ReactDOM.render(
            React.createElement(FundingComponents.AdminFundingEmbed, props),
            element
          );
        });

        // Initialize create funding goal forms
        document.querySelectorAll('[data-create-funding-goal]').forEach(function(element) {
          const props = {
            creatorId: element.dataset.creatorId || (window.currentUser && window.currentUser.id),
            onSuccess: function(goal) {
              console.log('Funding goal created:', goal);
              if (element.dataset.redirectOnSuccess) {
                window.location.href = element.dataset.redirectOnSuccess;
              }
            }
          };
          
          ReactDOM.render(
            React.createElement(FundingComponents.CreateFundingGoalEmbed, props),
            element
          );
        });
      },

      /**
       * Initialize funding components for a specific series page
       * @param {string} seriesId - ID of the series
       */
      seriesPage: function(seriesId) {
        // Add funding goals to series page
        const fundingContainer = document.getElementById('series-funding-goals');
        if (fundingContainer) {
          window.DreamsUnchartedFunding.embed.fundingGoals('series-funding-goals', {
            seriesId: seriesId,
            limit: 2
          });
        }

        // Add donation button to series page
        const donationContainer = document.getElementById('series-donation-button');
        if (donationContainer && window.activeGoalId) {
          window.DreamsUnchartedFunding.embed.donationButton('series-donation-button', {
            goalId: window.activeGoalId,
            buttonText: 'Support This Series',
            className: 'series-support-button'
          });
        }
      },

      /**
       * Initialize funding components for admin pages
       * @param {string} creatorId - ID of the creator
       */
      adminPage: function(creatorId) {
        // Add admin funding management
        const adminContainer = document.getElementById('admin-funding-management');
        if (adminContainer) {
          window.DreamsUnchartedFunding.embed.adminFunding('admin-funding-management', {
            creatorId: creatorId
          });
        }

        // Add create funding goal form
        const createContainer = document.getElementById('create-funding-goal');
        if (createContainer) {
          window.DreamsUnchartedFunding.embed.createFundingGoal('create-funding-goal', {
            creatorId: creatorId,
            onSuccess: function(goal) {
              alert('Funding goal created successfully!');
              window.location.reload();
            }
          });
        }
      }
    },

    // Event handlers
    events: {
      /**
       * Handle successful donation
       * @param {Object} donation - Donation data
       */
      onDonationSuccess: function(donation) {
        console.log('Donation successful:', donation);
        
        // Show success message
        if (typeof window.showNotification === 'function') {
          window.showNotification('Thank you for your donation!', 'success');
        } else {
          alert('Thank you for your donation!');
        }

        // Refresh funding displays
        window.location.reload();
      },

      /**
       * Handle donation error
       * @param {Error} error - Error object
       */
      onDonationError: function(error) {
        console.error('Donation error:', error);
        
        // Show error message
        if (typeof window.showNotification === 'function') {
          window.showNotification('Donation failed. Please try again.', 'error');
        } else {
          alert('Donation failed. Please try again.');
        }
      },

      /**
       * Handle funding goal completion
       * @param {Object} goal - Completed funding goal
       */
      onGoalCompleted: function(goal) {
        console.log('Funding goal completed:', goal);
        
        // Show celebration message
        if (typeof window.showNotification === 'function') {
          window.showNotification(`Funding goal "${goal.title}" has been completed!`, 'success');
        }
      }
    }
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.DreamsUnchartedFunding.init.autoInit);
  } else {
    window.DreamsUnchartedFunding.init.autoInit();
  }

  // Expose global shorthand functions for convenience
  window.embedFundingGoals = window.DreamsUnchartedFunding.embed.fundingGoals;
  window.embedDonationButton = window.DreamsUnchartedFunding.embed.donationButton;
  window.embedAdminFunding = window.DreamsUnchartedFunding.embed.adminFunding;
  window.embedCreateFundingGoal = window.DreamsUnchartedFunding.embed.createFundingGoal;

})(window);

