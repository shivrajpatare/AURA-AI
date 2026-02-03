import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const checkBackendHealth = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/health`);
        return response.data;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return null;
    }
};
