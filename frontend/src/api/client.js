import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_URL,
});

// attach the JWT to every request once the user is logged in
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('notepad_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// a 401 anywhere means the token is missing/expired - drop it and
// let the app redirect back to login on the next protected-route check
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('notepad_token');
      localStorage.removeItem('notepad_user');
    }
    return Promise.reject(error);
  }
);

export default client;