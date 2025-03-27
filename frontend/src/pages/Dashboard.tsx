import React, { useEffect, useState } from 'react';
import { stockApi } from '../utils/api';
import StockCard from '../components/StockCard';
import '../styles/Dashboard.css';

interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
  companyName?: string;
}

const Dashboard: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch popular stocks
        const stocksResponse = await stockApi.getPopularStocks();
        setStocks(stocksResponse.stocks);
        
        // Fetch user favorites
        const favoritesResponse = await stockApi.getFavorites();
        setFavorites(favoritesResponse.favorites.map((fav: any) => fav.symbol));
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load stock data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToFavorites = async (stock: Stock) => {
    try {
      await stockApi.addFavorite(stock.symbol, stock.companyName || '');
      setFavorites([...favorites, stock.symbol]);
    } catch (err) {
      console.error('Error adding to favorites:', err);
      alert('Failed to add to favorites. Please try again.');
    }
  };

  const handleRemoveFromFavorites = async (symbol: string) => {
    try {
      await stockApi.removeFavorite(symbol);
      setFavorites(favorites.filter(fav => fav !== symbol));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading stock data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Stock Market Dashboard</h1>
        <p>Real-time stock prices for popular companies</p>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a stock symbol..."
          className="search-input"
        />
        <button className="btn btn-primary search-button">Search</button>
      </div>
      
      <div className="stocks-grid">
        {stocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            symbol={stock.symbol}
            price={stock.price}
            change={stock.change}
            changePercent={stock.changePercent}
            companyName={stock.companyName}
            isFavorite={favorites.includes(stock.symbol)}
            onAddToFavorites={() => handleAddToFavorites(stock)}
            onRemoveFromFavorites={() => handleRemoveFromFavorites(stock.symbol)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
