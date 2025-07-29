import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fundingAPI } from '../services/fundingAPI';

// Hook for fetching funding goals
export const useFundingGoals = (filters = {}) => {
  const { page = 1, limit = 10, status = 'active', creator } = filters;
  
  return useQuery(
    ['fundingGoals', { page, limit, status, creator }],
    () => fundingAPI.getFundingGoals({ page, limit, status, creator }),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

// Hook for fetching a single funding goal
export const useFundingGoal = (goalId) => {
  return useQuery(
    ['fundingGoal', goalId],
    () => fundingAPI.getFundingGoal(goalId),
    {
      enabled: !!goalId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};

// Hook for creating funding goals
export const useCreateFundingGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation(fundingAPI.createFundingGoal, {
    onSuccess: () => {
      queryClient.invalidateQueries('fundingGoals');
    },
  });
};

// Hook for updating funding goals
export const useUpdateFundingGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ goalId, updates }) => fundingAPI.updateFundingGoal(goalId, updates),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['fundingGoal', variables.goalId]);
        queryClient.invalidateQueries('fundingGoals');
      },
    }
  );
};

// Hook for deleting funding goals
export const useDeleteFundingGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation(fundingAPI.deleteFundingGoal, {
    onSuccess: () => {
      queryClient.invalidateQueries('fundingGoals');
    },
  });
};

// Hook for fetching creator's funding goals
export const useCreatorFundingGoals = (creatorId, filters = {}) => {
  const { page = 1, limit = 10, status } = filters;
  
  return useQuery(
    ['creatorFundingGoals', creatorId, { page, limit, status }],
    () => fundingAPI.getCreatorFundingGoals(creatorId, { page, limit, status }),
    {
      enabled: !!creatorId,
      keepPreviousData: true,
    }
  );
};

// Hook for fetching series funding goals
export const useSeriesFundingGoals = (seriesId) => {
  return useQuery(
    ['seriesFundingGoals', seriesId],
    () => fundingAPI.getSeriesFundingGoals(seriesId),
    {
      enabled: !!seriesId,
    }
  );
};

// Hook for fetching donations for a funding goal
export const useFundingGoalDonations = (goalId, filters = {}) => {
  const { page = 1, limit = 20 } = filters;
  
  return useQuery(
    ['fundingGoalDonations', goalId, { page, limit }],
    () => fundingAPI.getFundingGoalDonations(goalId, { page, limit }),
    {
      enabled: !!goalId,
      keepPreviousData: true,
    }
  );
};

// Hook for real-time funding goal updates
export const useFundingGoalUpdates = (goalId) => {
  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!goalId) return;
    
    let intervalId;
    
    const fetchGoal = async () => {
      try {
        const data = await fundingAPI.getFundingGoal(goalId);
        setGoal(data.goal);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchGoal();
    
    // Set up polling for real-time updates
    intervalId = setInterval(fetchGoal, 30000); // Update every 30 seconds
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [goalId]);
  
  return { goal, isLoading, error };
};

// Hook for funding statistics
export const useFundingStats = (creatorId) => {
  return useQuery(
    ['fundingStats', creatorId],
    () => fundingAPI.getFundingStats(creatorId),
    {
      enabled: !!creatorId,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

// Hook for donation history
export const useDonationHistory = (userId, filters = {}) => {
  const { page = 1, limit = 20 } = filters;
  
  return useQuery(
    ['donationHistory', userId, { page, limit }],
    () => fundingAPI.getDonationHistory(userId, { page, limit }),
    {
      enabled: !!userId,
      keepPreviousData: true,
    }
  );
};

// Custom hook for funding goal form management
export const useFundingGoalForm = (initialData = null) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    fundingType: 'chapter',
    deadline: '',
    contentId: '',
    seriesId: '',
    rewardTiers: [],
    settings: {
      allowAnonymousDonations: true,
      showDonorList: true,
      sendUpdates: true
    },
    ...initialData
  });
  
  const [errors, setErrors] = useState({});
  
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };
  
  const updateNestedField = (parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };
  
  const addRewardTier = () => {
    const newTier = {
      amount: '',
      title: '',
      description: '',
      maxBackers: null
    };
    
    setFormData(prev => ({
      ...prev,
      rewardTiers: [...prev.rewardTiers, newTier]
    }));
  };
  
  const updateRewardTier = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      rewardTiers: prev.rewardTiers.map((tier, i) => 
        i === index ? { ...tier, [field]: value } : tier
      )
    }));
  };
  
  const removeRewardTier = (index) => {
    setFormData(prev => ({
      ...prev,
      rewardTiers: prev.rewardTiers.filter((_, i) => i !== index)
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.targetAmount || formData.targetAmount <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }
    
    if (formData.deadline && new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }
    
    // Validate reward tiers
    formData.rewardTiers.forEach((tier, index) => {
      if (!tier.amount || tier.amount <= 0) {
        newErrors[`rewardTier_${index}_amount`] = 'Reward amount is required';
      }
      if (!tier.title.trim()) {
        newErrors[`rewardTier_${index}_title`] = 'Reward title is required';
      }
      if (!tier.description.trim()) {
        newErrors[`rewardTier_${index}_description`] = 'Reward description is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      fundingType: 'chapter',
      deadline: '',
      contentId: '',
      seriesId: '',
      rewardTiers: [],
      settings: {
        allowAnonymousDonations: true,
        showDonorList: true,
        sendUpdates: true
      }
    });
    setErrors({});
  };
  
  return {
    formData,
    errors,
    updateField,
    updateNestedField,
    addRewardTier,
    updateRewardTier,
    removeRewardTier,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0
  };
};

export default {
  useFundingGoals,
  useFundingGoal,
  useCreateFundingGoal,
  useUpdateFundingGoal,
  useDeleteFundingGoal,
  useCreatorFundingGoals,
  useSeriesFundingGoals,
  useFundingGoalDonations,
  useFundingGoalUpdates,
  useFundingStats,
  useDonationHistory,
  useFundingGoalForm
};

