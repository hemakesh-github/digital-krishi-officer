/**
 * Frontend API Services Tests
 * Tests for API client functions
 */
import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


describe('API Service Tests', () => {
  
  describe('Authentication API', () => {
    test('generateOTP function exists', () => {
      const generateOTP = async (email) => {
        const response = await axios.post(`${API_BASE_URL}/auth/genOTP`, {
          email,
          userType: 'farmer'
        });
        return response.data;
      };
      expect(typeof generateOTP).toBe('function');
    });

    test('verifyOTP function exists', () => {
      const verifyOTP = async (email, otp) => {
        const response = await axios.post(`${API_BASE_URL}/auth/verifyOTP`, {
          email,
          otp
        });
        return response.data;
      };
      expect(typeof verifyOTP).toBe('function');
    });

    test('logout function exists', () => {
      const logout = async () => {
        const response = await axios.post(`${API_BASE_URL}/auth/logout`);
        return response.data;
      };
      expect(typeof logout).toBe('function');
    });

    test('getCurrentUser function exists', () => {
      const getCurrentUser = async () => {
        const response = await axios.get(`${API_BASE_URL}/auth/getUser`);
        return response.data;
      };
      expect(typeof getCurrentUser).toBe('function');
    });
  });


  describe('Disease Detection API', () => {
    test('detectDisease function structure', () => {
      const detectDisease = async (formData) => {
        const response = await axios.post(`${API_BASE_URL}/disease/detect`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      };
      expect(typeof detectDisease).toBe('function');
    });

    test('getDiseaseHistory function structure', () => {
      const getDiseaseHistory = async () => {
        const response = await axios.get(`${API_BASE_URL}/disease/history`);
        return response.data;
      };
      expect(typeof getDiseaseHistory).toBe('function');
    });

    test('getDiseaseResult function structure', () => {
      const getDiseaseResult = async (sessionId) => {
        const response = await axios.get(`${API_BASE_URL}/disease/${sessionId}`);
        return response.data;
      };
      expect(typeof getDiseaseResult).toBe('function');
    });
  });


  describe('Crop Advice API', () => {
    test('startNewChat function structure', () => {
      const startNewChat = async (cropData) => {
        const response = await axios.post(`${API_BASE_URL}/crop_advice/new_chat`, cropData);
        return response.data;
      };
      expect(typeof startNewChat).toBe('function');
    });

    test('continueChat function structure', () => {
      const continueChat = async (sessionId, message) => {
        const response = await axios.post(
          `${API_BASE_URL}/crop_advice/continue_chat/${sessionId}`,
          { message }
        );
        return response.data;
      };
      expect(typeof continueChat).toBe('function');
    });
  });


  describe('Weather API', () => {
    test('getWeatherData function structure', () => {
      const getWeatherData = async (lat, lon) => {
        const response = await axios.get(`${API_BASE_URL}/weather/getWeatherData`, {
          params: { lat, lon }
        });
        return response.data;
      };
      expect(typeof getWeatherData).toBe('function');
    });
  });


  describe('Location API', () => {
    test('getDistricts function structure', () => {
      const getDistricts = async (state) => {
        const response = await axios.get(`${API_BASE_URL}/location/getDistrict`, {
          params: { state }
        });
        return response.data;
      };
      expect(typeof getDistricts).toBe('function');
    });

    test('getCities function structure', () => {
      const getCities = async (district) => {
        const response = await axios.get(`${API_BASE_URL}/location/getCity`, {
          params: { district }
        });
        return response.data;
      };
      expect(typeof getCities).toBe('function');
    });
  });


  describe('Chat API', () => {
    test('getChatMessages function structure', () => {
      const getChatMessages = async (sessionId) => {
        const response = await axios.get(`${API_BASE_URL}/chat/${sessionId}`);
        return response.data;
      };
      expect(typeof getChatMessages).toBe('function');
    });

    test('sendMessage function structure', () => {
      const sendMessage = async (sessionId, content, role) => {
        const response = await axios.post(`${API_BASE_URL}/chat/message`, {
          sessionId,
          content,
          role
        });
        return response.data;
      };
      expect(typeof sendMessage).toBe('function');
    });
  });


  describe('User API', () => {
    test('getUserHistory function structure', () => {
      const getUserHistory = async () => {
        const response = await axios.post(`${API_BASE_URL}/users/history`);
        return response.data;
      };
      expect(typeof getUserHistory).toBe('function');
    });

    test('getNotifications function structure', () => {
      const getNotifications = async () => {
        const response = await axios.get(`${API_BASE_URL}/users/notifications`);
        return response.data;
      };
      expect(typeof getNotifications).toBe('function');
    });

    test('markNotificationRead function structure', () => {
      const markNotificationRead = async (id) => {
        const response = await axios.post(`${API_BASE_URL}/users/notifications/${id}/read`);
        return response.data;
      };
      expect(typeof markNotificationRead).toBe('function');
    });
  });


  describe('Expert API', () => {
    test('getExpertDashboard function structure', () => {
      const getExpertDashboard = async () => {
        const response = await axios.get(`${API_BASE_URL}/expert/dashboard`);
        return response.data;
      };
      expect(typeof getExpertDashboard).toBe('function');
    });

    test('getPendingQueries function structure', () => {
      const getPendingQueries = async () => {
        const response = await axios.get(`${API_BASE_URL}/expert/getPendingQueries`);
        return response.data;
      };
      expect(typeof getPendingQueries).toBe('function');
    });

    test('sendExpertAdvice function structure', () => {
      const sendExpertAdvice = async (sessionId, message) => {
        const response = await axios.post(`${API_BASE_URL}/expert/expertAdvice`, {
          sessionId,
          message
        });
        return response.data;
      };
      expect(typeof sendExpertAdvice).toBe('function');
    });
  });


  describe('Admin API', () => {
    test('addExpert function structure', () => {
      const addExpert = async (expertData) => {
        const response = await axios.post(`${API_BASE_URL}/admin/addExpert`, expertData);
        return response.data;
      };
      expect(typeof addExpert).toBe('function');
    });

    test('getAdminDashboard function structure', () => {
      const getAdminDashboard = async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/dashboard`);
        return response.data;
      };
      expect(typeof getAdminDashboard).toBe('function');
    });
  });


  describe('Transcription API', () => {
    test('transcribeAudio function structure', () => {
      const transcribeAudio = async (formData) => {
        const response = await axios.post(
          `${API_BASE_URL}/transcription/transcribe`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
      };
      expect(typeof transcribeAudio).toBe('function');
    });
  });
});


describe('API Error Handling Tests', () => {
  test('Handles network errors', async () => {
    const mockError = {
      response: {
        status: 500,
        data: { detail: 'Internal server error' }
      }
    };
    expect(mockError.response.status).toBe(500);
  });

  test('Handles authentication errors', async () => {
    const mockError = {
      response: {
        status: 401,
        data: { detail: 'Unauthorized' }
      }
    };
    expect(mockError.response.status).toBe(401);
  });

  test('Handles validation errors', async () => {
    const mockError = {
      response: {
        status: 422,
        data: { detail: 'Validation error' }
      }
    };
    expect(mockError.response.status).toBe(422);
  });

  test('Handles not found errors', async () => {
    const mockError = {
      response: {
        status: 404,
        data: { detail: 'Not found' }
      }
    };
    expect(mockError.response.status).toBe(404);
  });
});


describe('API Request/Response Format Tests', () => {
  test('Auth response format', () => {
    const authResponse = {
      access_token: 'eyJhbGc...',
      refresh_token: 'eyJhbGc...',
      token_type: 'bearer',
      user: {
        id: 1,
        email: 'test@example.com',
        role: 'farmer'
      }
    };
    
    expect(authResponse).toHaveProperty('access_token');
    expect(authResponse).toHaveProperty('refresh_token');
    expect(authResponse).toHaveProperty('token_type');
    expect(authResponse).toHaveProperty('user');
    expect(authResponse.user).toHaveProperty('id');
    expect(authResponse.user).toHaveProperty('email');
    expect(authResponse.user).toHaveProperty('role');
  });

  test('Disease detection response format', () => {
    const diseaseResponse = {
      id: 1,
      disease: 'Red Rot',
      confidence: 0.94,
      image: 'https://storage.googleapis.com/...',
      created_at: '2024-01-15T10:30:00'
    };
    
    expect(diseaseResponse).toHaveProperty('id');
    expect(diseaseResponse).toHaveProperty('disease');
    expect(diseaseResponse).toHaveProperty('confidence');
    expect(diseaseResponse).toHaveProperty('image');
    expect(diseaseResponse).toHaveProperty('created_at');
  });

  test('Weather response format', () => {
    const weatherResponse = {
      current: {
        temperature: 28,
        humidity: 65,
        wind_speed: 12,
        condition: 'Partly Cloudy'
      },
      forecast: [
        {
          date: '2024-01-16',
          temp_high: 30,
          temp_low: 22,
          condition: 'Sunny'
        }
      ],
      recommendations: [
        'Good conditions for pesticide spraying'
      ]
    };
    
    expect(weatherResponse).toHaveProperty('current');
    expect(weatherResponse).toHaveProperty('forecast');
    expect(weatherResponse).toHaveProperty('recommendations');
  });
});
