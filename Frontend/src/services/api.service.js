import axios from 'axios';
import { apiConfig } from '../config/api.config';

const api = axios.create(apiConfig);

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;