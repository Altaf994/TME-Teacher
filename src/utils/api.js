import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem(process.env.REACT_APP_AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(
          process.env.REACT_APP_REFRESH_TOKEN_KEY
        );
        if (refreshToken) {
          const response = await axios.post('/auth/refresh', {
            refreshToken,
          });
          const { accessToken } = response.data;

          localStorage.setItem(
            process.env.REACT_APP_AUTH_TOKEN_KEY,
            accessToken
          );
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem(process.env.REACT_APP_AUTH_TOKEN_KEY);
        localStorage.removeItem(process.env.REACT_APP_REFRESH_TOKEN_KEY);
        // window.location.href = '/login';
      }
    }

    // Show toast for errors except login
    const isLoginError = error.config?.url?.includes('/auth/login');
    if (!isLoginError) {
      const message =
        error.response?.data?.message || error.message || 'An error occurred';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};

// Questions API
export const questionsAPI = {
  generateQuestions: async (
    concept,
    lengthOfQuestion,
    numberOfQuestions,
    studentId,
    teacherId,
    activityName
  ) => {
    try {
      console.log('API call starting with parameters:', {
        concept,
        lengthOfQuestion,
        numberOfQuestions,
        studentId,
        teacherId,
        activityName,
      });

      const requestData = {
        concept,
        length_of_question: lengthOfQuestion.toString(),
        number_of_questions: numberOfQuestions,
        student_id: studentId,
        teacher_id: teacherId,
        activity_name: activityName,
      };

      console.log('Request data:', requestData);
      console.log('Making POST request to:', '/assign-questions/');

      const response = await api.post('/assign-questions/', requestData);

      console.log('API response received:', response);

      // Handle the assign-questions response format
      if (response.data && response.data.assigned_questions) {
        return { questions: response.data.assigned_questions };
      } else if (response.data && response.data.message) {
        // If no questions but successful response
        return { questions: [] };
      } else {
        return { questions: [] };
      }
    } catch (error) {
      console.error('Error generating questions:', error);

      // Provide more specific error messages
      if (error.response?.status === 400) {
        throw new Error('Invalid request parameters. Please check your input.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        throw new Error(
          'Network error. Please check your internet connection.'
        );
      } else {
        throw new Error(
          error.response?.data?.message ||
            'Failed to generate questions. Please try again.'
        );
      }
    }
  },

  getQuestionFilters: async () => {
    try {
      const response = await api.get('/question-filters');
      return response.data;
    } catch (error) {
      console.error('Error fetching question filters:', error);
      throw new Error('Failed to fetch question filters. Please try again.');
    }
  },

  getAvailableConcepts: async () => {
    try {
      // For now, we'll use a workaround to get concepts by trying different known values
      // In the future, you should create a dedicated endpoint for this
      const knownConcepts = [
        'Junior +3',
        'Junior +4',
        'Junior +5',
        'Senior +3',
        'Senior +4',
        'Senior +5',
        'Senior -3',
        'Senior -4',
        'Senior -5',
        'Multiplication',
        'Division',
        'Triple Digit Without Formula',
        'Triple Digit With Formula',
        'Double Digit Without Formula',
        'Double Digit With Formula',
      ];

      const availableConcepts = [];

      // Test each concept to see if it has questions available
      for (const concept of knownConcepts) {
        try {
          const response = await api.post('/questions/', {
            concept,
            length_of_question: '8',
            number_of_questions: 1,
          });

          // If we get a response (even if empty), the concept exists
          if (response.data !== undefined) {
            availableConcepts.push({
              id: concept.toLowerCase().replace(/\s+/g, '_'),
              label: concept,
              apiValue: concept,
            });
          }
        } catch (error) {
          // If there's an error, the concept might not exist
          console.log(`Concept "${concept}" not available:`, error.message);
        }
      }

      return availableConcepts;
    } catch (error) {
      console.error('Error fetching available concepts:', error);
      throw new Error('Failed to fetch available concepts. Please try again.');
    }
  },
};

// Assignments API
export const assignmentsAPI = {
  createAssignment: async assignmentData => {
    try {
      console.log('Creating assignment with payload:', assignmentData);
      const response = await api.post('/assignments/', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw new Error('Failed to create assignment. Please try again.');
    }
  },
};

export default api;
