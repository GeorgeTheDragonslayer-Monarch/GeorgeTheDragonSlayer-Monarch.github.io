/**
 * Dreams Uncharted Funding API Service
 */

// Base API URL
const API_BASE = '/api';

// Helper function for API calls
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Funding Goals API Functions
export const getFundingGoals = async (options = {}) => {
  const params = new URLSearchParams(options);
  return apiCall(`${API_BASE}/funding/goals?${params}`);
};

export const getFundingGoal = async (goalId) => {
  return apiCall(`${API_BASE}/funding/goals/${goalId}`);
};

export const getSeriesFundingGoals = async (seriesId, options = {}) => {
  const params = new URLSearchParams(options);
  return apiCall(`${API_BASE}/funding/series/${seriesId}/goals?${params}`);
};

export const getCreatorFundingGoals = async (creatorId, options = {}) => {
  const params = new URLSearchParams(options);
  return apiCall(`${API_BASE}/funding/creator/${creatorId}/goals?${params}`);
};

export const createFundingGoal = async (goalData) => {
  return apiCall(`${API_BASE}/funding/goals`, {
    method: 'POST',
    body: JSON.stringify(goalData),
  });
};

export const updateFundingGoal = async (goalId, updates) => {
  return apiCall(`${API_BASE}/funding/goals/${goalId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const deleteFundingGoal = async (goalId) => {
  return apiCall(`${API_BASE}/funding/goals/${goalId}`, {
    method: 'DELETE',
  });
};

export const getFundingStats = async (creatorId) => {
  return apiCall(`${API_BASE}/funding/stats/${creatorId}`);
};

// Payment/Donation API Functions
export const processDonation = async (donationData) => {
  return apiCall(`${API_BASE}/payments/process`, {
    method: 'POST',
    body: JSON.stringify(donationData),
  });
};

export const createStripePaymentIntent = async (paymentData) => {
  return apiCall(`${API_BASE}/payments/stripe/create-payment-intent`, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

export const createPayPalPayment = async (paymentData) => {
  return apiCall(`${API_BASE}/payments/paypal/create-payment`, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

// Content API Functions (if needed)
export const getContent = async (contentId) => {
  return apiCall(`${API_BASE}/content/${contentId}`);
};

export const getSeries = async (seriesId) => {
  return apiCall(`${API_BASE}/content/series/${seriesId}`);
};

// API Classes for organized access
export class FundingAPI {
  static getGoals = getFundingGoals;
  static getGoal = getFundingGoal;
  static getSeriesGoals = getSeriesFundingGoals;
  static getCreatorGoals = getCreatorFundingGoals;
  static create = createFundingGoal;
  static update = updateFundingGoal;
  static delete = deleteFundingGoal;
  static getStats = getFundingStats;
}

export class PaymentAPI {
  static processDonation = processDonation;
  static createStripeIntent = createStripePaymentIntent;
  static createPayPalPayment = createPayPalPayment;
}

export class ContentAPI {
  static getContent = getContent;
  static getSeries = getSeries;
}

// Default exports for convenience
export const fundingAPI = FundingAPI;
export const paymentAPI = PaymentAPI;
export const contentAPI = ContentAPI;

export default {
  funding: FundingAPI,
  payment: PaymentAPI,
  content: ContentAPI,
};

