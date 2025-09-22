import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const originalRequestUrl = error.config.url;
      const excludedUrls = ['/auth/login/', '/auth/token/refresh/'];

      if (!excludedUrls.some(url => originalRequestUrl.endsWith(url))) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('winguport_user');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
