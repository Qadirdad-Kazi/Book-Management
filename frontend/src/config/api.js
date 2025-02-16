const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5555';

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

export default {
    baseURL: API_BASE_URL,
};
