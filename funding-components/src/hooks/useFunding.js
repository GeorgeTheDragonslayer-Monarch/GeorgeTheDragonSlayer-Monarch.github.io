/**
 * React hooks for Dreams Uncharted Funding System
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as fundingAPI from '../services/fundingAPI';

// Get all funding goals
export const useFundingGoals = (options = {}) => {
  return useQuery({
    queryKey: ['fundingGoals', options],
    queryFn: () => fundingAPI.getFundingGoals(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get funding goals for a specific series
export const useSeriesFundingGoals = (seriesId, options = {}) => {
  return useQuery({
    queryKey: ['seriesFundingGoals', seriesId, options],
    queryFn: () => fundingAPI.getSeriesFundingGoals(seriesId, options),
    enabled: !!seriesId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get funding goals for a specific creator
export const useCreatorFundingGoals = (creatorId, options = {}) => {
  return useQuery({
    queryKey: ['creatorFundingGoals', creatorId, options],
    queryFn: () => fundingAPI.getCreatorFundingGoals(creatorId, options),
    enabled: !!creatorId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get a specific funding goal
export const useFundingGoal = (goalId) => {
  return useQuery({
    queryKey: ['fundingGoal', goalId],
    queryFn: () => fundingAPI.getFundingGoal(goalId),
    enabled: !!goalId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get funding statistics for a creator
export const useFundingStats = (creatorId) => {
  return useQuery({
    queryKey: ['fundingStats', creatorId],
    queryFn: () => fundingAPI.getFundingStats(creatorId),
    enabled: !!creatorId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create a new funding goal
export const useCreateFundingGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fundingAPI.createFundingGoal,
    onSuccess: (data) => {
      // Invalidate and refetch funding goals
      queryClient.invalidateQueries({ queryKey: ['fundingGoals'] });
      queryClient.invalidateQueries({ queryKey: ['creatorFundingGoals'] });
      queryClient.invalidateQueries({ queryKey: ['seriesFundingGoals'] });
    },
  });
};

// Update a funding goal
export const useUpdateFundingGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, updates }) => fundingAPI.updateFundingGoal(goalId, updates),
    onSuccess: (data, variables) => {
      // Update the specific goal in cache
      queryClient.setQueryData(['fundingGoal', variables.goalId], data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['fundingGoals'] });
      queryClient.invalidateQueries({ queryKey: ['creatorFundingGoals'] });
      queryClient.invalidateQueries({ queryKey: ['seriesFundingGoals'] });
    },
  });
};

// Delete a funding goal
export const useDeleteFundingGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fundingAPI.deleteFundingGoal,
    onSuccess: (data, goalId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['fundingGoal', goalId] });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['fundingGoals'] });
      queryClient.invalidateQueries({ queryKey: ['creatorFundingGoals'] });
      queryClient.invalidateQueries({ queryKey: ['seriesFundingGoals'] });
    },
  });
};

// Process a donation
export const useProcessDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fundingAPI.processDonation,
    onSuccess: (data, variables) => {
      // Invalidate funding goal to refresh current amount
      queryClient.invalidateQueries({ queryKey: ['fundingGoal', variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ['fundingGoals'] });
      queryClient.invalidateQueries({ queryKey: ['fundingStats'] });
    },
  });
};

// Custom hook for managing funding goal form
export const useFundingGoalForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    fundingType: 'chapter',
    deadline: '',
    seriesId: '',
    rewardTiers: [],
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
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

    if (!formData.seriesId) {
      newErrors.seriesId = 'Please select a series';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: 0,
      fundingType: 'chapter',
      deadline: '',
      seriesId: '',
      rewardTiers: [],
      ...initialData,
    });
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    validateForm,
    resetForm,
  };
};

// Custom hook for managing donation flow
export const useDonationFlow = () => {
  const [currentStep, setCurrentStep] = useState('amount');
  const [donationData, setDonationData] = useState({
    amount: 0,
    goalId: null,
    donorInfo: {},
    selectedTier: null,
  });

  const resetFlow = () => {
    setCurrentStep('amount');
    setDonationData({
      amount: 0,
      goalId: null,
      donorInfo: {},
      selectedTier: null,
    });
  };

  const updateDonationData = (updates) => {
    setDonationData(prev => ({ ...prev, ...updates }));
  };

  return {
    currentStep,
    setCurrentStep,
    donationData,
    updateDonationData,
    resetFlow,
  };
};

// Custom hook for real-time funding goal updates
export const useRealTimeFundingGoal = (goalId, interval = 30000) => {
  const [isLive, setIsLive] = useState(false);
  
  const query = useQuery({
    queryKey: ['fundingGoal', goalId],
    queryFn: () => fundingAPI.getFundingGoal(goalId),
    enabled: !!goalId,
    refetchInterval: isLive ? interval : false,
    refetchIntervalInBackground: false,
  });

  const startLiveUpdates = () => setIsLive(true);
  const stopLiveUpdates = () => setIsLive(false);

  useEffect(() => {
    return () => stopLiveUpdates();
  }, []);

  return {
    ...query,
    isLive,
    startLiveUpdates,
    stopLiveUpdates,
  };
};

