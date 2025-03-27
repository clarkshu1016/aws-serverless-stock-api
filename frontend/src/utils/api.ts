import axios from 'axios';
import { config } from '../config';

const api = axios.create({
  baseURL: config.api.url,
});

// Add token to authorization header for every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('id_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const stockApi = {
  // Get popular stocks
  getPopularStocks: async () => {
    const response = await api.get('/stocks');
    return response.data;
  },
  
  // Get stock details by symbol
  getStockBySymbol: async (symbol: string) => {
    const response = await api.get(`/stocks/${symbol}`);
    return response.data;
  },
  
  // Get user favorites
  getFavorites: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },
  
  // Add stock to favorites
  addFavorite: async (symbol: string, companyName: string) => {
    const response = await api.post('/favorites', { symbol, companyName });
    return response.data;
  },
  
  // Remove stock from favorites
  removeFavorite: async (symbol: string) => {
    const response = await api.delete(`/favorites/${symbol}`);
    return response.data;
  },
};
