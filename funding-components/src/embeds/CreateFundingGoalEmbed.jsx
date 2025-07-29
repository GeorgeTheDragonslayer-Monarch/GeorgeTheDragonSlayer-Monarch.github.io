import React, { useState } from 'react';
import { useCreateFundingGoal, useFundingGoalForm } from '../hooks/useFunding';
import { formatCurrency } from '../utils/formatCurrency';

const CreateFundingGoalEmbed = ({ creatorId, onSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const createGoalMutation = useCreateFundingGoal();
  const {
    formData,
    errors,
    updateField,
    updateNestedField,
    addRewardTier,
    updateRewardTier,
    removeRewardTier,
    validateForm,
    resetForm
  } = useFundingGoalForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }

    try {
      const goalData = {
        ...formData,
        creator: creatorId,
        targetAmount: parseFloat(formData.targetAmount),
        rewardTiers: formData.rewardTiers.map(tier => ({
          ...tier,
          amount: parseFloat(tier.amount),
          maxBackers: tier.maxBackers ? parseInt(tier.maxBackers) : null
        }))
      };

      const result = await createGoalMutation.mutateAsync(goalData);
      
      alert('Funding goal created successfully!');
      resetForm();
      setIsExpanded(false);
      
      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (error) {
      alert('Error creating funding goal: ' + error.message);
    }
  };

  if (!isExpanded) {
    return (
      <div className="create-funding-collapsed">
        <button 
          className="btn btn-primary btn-large"
          onClick={() => setIsExpanded(true)}
        >
          + Create New Funding Goal
        </button>
      </div>
    );
  }

  return (
    <div className="create-funding-expanded">
      <div className="form-header">
        <h3>Create New Funding Goal</h3>
        <button 
          className="btn btn-secondary"
          onClick={() => setIsExpanded(false)}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="funding-goal-form">
        {/* Basic Information */}
        <div className="form-section">
          <h4>Basic Information</h4>
          
          <div className="form-group">
            <label htmlFor="title">Goal Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g., Next Chapter of Space Adventures"
              className={errors.title ? 'error' : ''}
              required
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe what this funding will help create..."
              rows={4}
              className={errors.description ? 'error' : ''}
              required
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetAmount">Target Amount ($) *</label>
              <input
                id="targetAmount"
                type="number"
                min="1"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => updateField('targetAmount', e.target.value)}
                placeholder="500.00"
                className={errors.targetAmount ? 'error' : ''}
                required
              />
              {errors.targetAmount && <span className="error-text">{errors.targetAmount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fundingType">Content Type *</label>
              <select
                id="fundingType"
                value={formData.fundingType}
                onChange={(e) => updateField('fundingType', e.target.value)}
                required
              >
                <option value="chapter">Chapter</option>
                <option value="episode">Episode</option>
                <option value="page">Page</option>
                <option value="artwork">Artwork</option>
                <option value="bonus-content">Bonus Content</option>
                <option value="series-continuation">Series Continuation</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Deadline (Optional)</label>
            <input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => updateField('deadline', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={errors.deadline ? 'error' : ''}
            />
            {errors.deadline && <span className="error-text">{errors.deadline}</span>}
          </div>
        </div>

        {/* Reward Tiers */}
        <div className="form-section">
          <div className="section-header">
            <h4>Reward Tiers</h4>
            <button 
              type="button"
              className="btn btn-secondary btn-small"
              onClick={addRewardTier}
            >
              + Add Tier
            </button>
          </div>

          {formData.rewardTiers.map((tier, index) => (
            <div key={index} className="reward-tier-form">
              <div className="tier-header">
                <h5>Reward Tier {index + 1}</h5>
                <button 
                  type="button"
                  className="btn btn-danger btn-small"
                  onClick={() => removeRewardTier(index)}
                >
                  Remove
                </button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount ($) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={tier.amount}
                    onChange={(e) => updateRewardTier(index, 'amount', e.target.value)}
                    placeholder="25.00"
                    className={errors[`rewardTier_${index}_amount`] ? 'error' : ''}
                    required
                  />
                  {errors[`rewardTier_${index}_amount`] && (
                    <span className="error-text">{errors[`rewardTier_${index}_amount`]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Max Backers</label>
                  <input
                    type="number"
                    min="1"
                    value={tier.maxBackers || ''}
                    onChange={(e) => updateRewardTier(index, 'maxBackers', e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reward Title *</label>
                <input
                  type="text"
                  value={tier.title}
                  onChange={(e) => updateRewardTier(index, 'title', e.target.value)}
                  placeholder="e.g., Early Access"
                  className={errors[`rewardTier_${index}_title`] ? 'error' : ''}
                  required
                />
                {errors[`rewardTier_${index}_title`] && (
                  <span className="error-text">{errors[`rewardTier_${index}_title`]}</span>
                )}
              </div>

              <div className="form-group">
                <label>Reward Description *</label>
                <textarea
                  value={tier.description}
                  onChange={(e) => updateRewardTier(index, 'description', e.target.value)}
                  placeholder="Describe what backers get for this tier..."
                  rows={2}
                  className={errors[`rewardTier_${index}_description`] ? 'error' : ''}
                  required
                />
                {errors[`rewardTier_${index}_description`] && (
                  <span className="error-text">{errors[`rewardTier_${index}_description`]}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="form-section">
          <h4>Settings</h4>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.settings.allowAnonymousDonations}
                onChange={(e) => updateNestedField('settings', 'allowAnonymousDonations', e.target.checked)}
              />
              Allow anonymous donations
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.settings.showDonorList}
                onChange={(e) => updateNestedField('settings', 'showDonorList', e.target.checked)}
              />
              Show donor list publicly
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.settings.sendUpdates}
                onChange={(e) => updateNestedField('settings', 'sendUpdates', e.target.checked)}
              />
              Send progress updates to donors
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsExpanded(false)}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="btn btn-primary"
            disabled={createGoalMutation.isLoading}
          >
            {createGoalMutation.isLoading ? 'Creating...' : 'Create Funding Goal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFundingGoalEmbed;

