import React, { useState } from 'react';
import { useCreatorFundingGoals, useDeleteFundingGoal, useFundingStats } from '../hooks/useFunding';
import { formatCurrency } from '../utils/formatCurrency';
import ProgressBar from '../components/ProgressBar';

const AdminFundingEmbed = ({ creatorId }) => {
  const [filter, setFilter] = useState('active');
  const { data: goalsData, isLoading, refetch } = useCreatorFundingGoals(creatorId, { status: filter });
  const { data: statsData } = useFundingStats(creatorId);
  const deleteGoalMutation = useDeleteFundingGoal();

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this funding goal?')) {
      try {
        await deleteGoalMutation.mutateAsync(goalId);
        refetch();
        alert('Funding goal deleted successfully');
      } catch (error) {
        alert('Error deleting funding goal: ' + error.message);
      }
    }
  };

  if (isLoading) return <div className="admin-loading">Loading your funding goals...</div>;

  const goals = goalsData?.data?.goals || [];
  const stats = statsData?.data || {};

  return (
    <div className="admin-funding-embed">
      {/* Funding Statistics */}
      <div className="funding-stats">
        <h3>Your Funding Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Raised</h4>
            <p className="stat-value">{formatCurrency(stats.totalFundingRaised || 0)}</p>
          </div>
          <div className="stat-card">
            <h4>Active Goals</h4>
            <p className="stat-value">{stats.activeFundingGoals || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Completed Goals</h4>
            <p className="stat-value">{stats.completedFundingGoals || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Total Donations</h4>
            <p className="stat-value">{stats.totalDonationsReceived || 0}</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="funding-filters">
        <button 
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active Goals
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed Goals
        </button>
        <button 
          className={filter === '' ? 'active' : ''}
          onClick={() => setFilter('')}
        >
          All Goals
        </button>
      </div>

      {/* Funding Goals List */}
      <div className="admin-goals-list">
        {goals.length === 0 ? (
          <div className="no-goals">
            <p>No funding goals found.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '#create-funding-goal'}
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          goals.map(goal => (
            <div key={goal._id} className="admin-goal-card">
              <div className="goal-header">
                <h4>{goal.title}</h4>
                <div className="goal-actions">
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => window.open(`/funding/goals/${goal._id}`, '_blank')}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => window.location.href = `#edit-goal-${goal._id}`}
                  >
                    Edit
                  </button>
                  {goal.status === 'active' && goal.currentAmount === 0 && (
                    <button 
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteGoal(goal._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              
              <div className="goal-progress">
                <ProgressBar 
                  current={goal.currentAmount} 
                  target={goal.targetAmount}
                  showPercentage={true}
                />
                <div className="progress-text">
                  {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                  {goal.stats?.totalDonations > 0 && (
                    <span className="donation-count">
                      • {goal.stats.totalDonations} donation{goal.stats.totalDonations !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="goal-meta">
                <span className={`goal-status ${goal.status}`}>
                  {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                </span>
                <span className="goal-type">
                  {goal.fundingType.replace('-', ' ')}
                </span>
                {goal.deadline && (
                  <span className="goal-deadline">
                    Ends: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {goal.description && (
                <p className="goal-description">
                  {goal.description.length > 100 
                    ? `${goal.description.substring(0, 100)}...`
                    : goal.description
                  }
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFundingEmbed;

