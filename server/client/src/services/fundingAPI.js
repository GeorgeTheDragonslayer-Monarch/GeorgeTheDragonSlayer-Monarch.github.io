// Funding API Service
// Handles all API calls related to funding goals and donations

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class FundingAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/funding`;
  }

  // Helper method for making API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all funding goals with filters
  async getFundingGoals(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const endpoint = `/goals?${queryParams.toString()}`;
    return this.request(endpoint);
  }

  // Get a specific funding goal by ID
  async getFundingGoal(goalId) {
    return this.request(`/goals/${goalId}`);
  }

  // Create a new funding goal
  async createFundingGoal(goalData) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  // Update an existing funding goal
  async updateFundingGoal(goalId, updates) {
    return this.request(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Delete a funding goal
  async deleteFundingGoal(goalId) {
    return this.request(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  }

  // Get funding goals for a specific creator
  async getCreatorFundingGoals(creatorId, filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const endpoint = `/creator/${creatorId}/goals?${queryParams.toString()}`;
    return this.request(endpoint);
  }

  // Get funding goals for a specific series
  async getSeriesFundingGoals(seriesId) {
    return this.request(`/series/${seriesId}/goals`);
  }

  // Get donations for a specific funding goal
  async getFundingGoalDonations(goalId, filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const endpoint = `/goals/${goalId}/donations?${queryParams.toString()}`;
    return this.request(endpoint);
  }

  // Get funding statistics for a creator
  async getFundingStats(creatorId) {
    return this.request(`/creator/${creatorId}/stats`);
  }

  // Get donation history for a user
  async getDonationHistory(userId, filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const endpoint = `/user/${userId}/donations?${queryParams.toString()}`;
    return this.request(endpoint);
  }

  // Search funding goals
  async searchFundingGoals(query, filters = {}) {
    const queryParams = new URLSearchParams({
      q: query,
      ...filters
    });

    const endpoint = `/search?${queryParams.toString()}`;
    return this.request(endpoint);
  }

  // Get trending funding goals
  async getTrendingFundingGoals(limit = 10) {
    return this.request(`/trending?limit=${limit}`);
  }

  // Get recently completed funding goals
  async getRecentlyCompleted(limit = 10) {
    return this.request(`/completed?limit=${limit}`);
  }

  // Get funding goals ending soon
  async getEndingSoon(limit = 10) {
    return this.request(`/ending-soon?limit=${limit}`);
  }

  // Admin endpoints
  async getAdminFundingGoals(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const endpoint = `/admin/goals?${queryParams.toString()}`;
    return this.request(endpoint);
  }

  async getAdminDonations(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const endpoint = `/admin/donations?${queryParams.toString()}`;
    return this.request(endpoint);
  }

  // Platform statistics
  async getPlatformStats() {
    return this.request('/admin/stats');
  }
}

// Payment API Service
class PaymentAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/payments`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Payment API request failed:', error);
      throw error;
    }
  }

  // Create Stripe payment intent
  async createStripePaymentIntent(paymentData) {
    return this.request('/stripe/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Create PayPal payment
  async createPayPalPayment(paymentData) {
    return this.request('/paypal/create-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Get donation status
  async getDonationStatus(donationId) {
    return this.request(`/donation/${donationId}/status`);
  }

  // Process refund (admin only)
  async processRefund(donationId, reason) {
    return this.request(`/donation/${donationId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }
}

// Content API extensions for funding integration
class ContentAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/content`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Content API request failed:', error);
      throw error;
    }
  }

  // Get content with funding information
  async getContentWithFunding(contentId) {
    return this.request(`/${contentId}/funding`);
  }

  // Get series with funding information
  async getSeriesWithFunding(seriesId) {
    return this.request(`/series/${seriesId}/funding`);
  }

  // Link funding goal to content
  async linkFundingGoal(contentId, fundingGoalId) {
    return this.request(`/${contentId}/funding/${fundingGoalId}`, {
      method: 'POST',
    });
  }

  // Unlink funding goal from content
  async unlinkFundingGoal(contentId, fundingGoalId) {
    return this.request(`/${contentId}/funding/${fundingGoalId}`, {
      method: 'DELETE',
    });
  }
}

// Create instances
export const fundingAPI = new FundingAPI();
export const paymentAPI = new PaymentAPI();
export const contentAPI = new ContentAPI();

// Export individual classes for advanced usage
export { FundingAPI, PaymentAPI, ContentAPI };

// Default export
export default {
  funding: fundingAPI,
  payment: paymentAPI,
  content: contentAPI,
};

