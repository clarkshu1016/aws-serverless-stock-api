import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stockApi } from '../utils/api';
import '../styles/StockDetails.css';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
  companyName: string;
  industry: string;
  description: string;
  pe: number;
  marketCap: string;
}

const StockDetails: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<StockData | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;
      
      try {
        setIsLoading(true);
        
        // Fetch stock details
        const stockData = await stockApi.getStockBySymbol(symbol);
        setStock(stockData);
        
        // Check if this stock is in favorites
        const favoritesResponse = await stockApi.getFavorites();
        const favoriteSymbols = favoritesResponse.favorites.map((fav: any) => fav.symbol);
        setIsFavorite(favoriteSymbols.includes(symbol));
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching stock details:', err);
        setError(`Failed to load details for ${symbol}. Please try again later.`);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  const handleAddToFavorites = async () => {
    if (!stock) return;
    
    try {
      await stockApi.addFavorite(stock.symbol, stock.companyName);
      setIsFavorite(true);
    } catch (err) {
      console.error('Error adding to favorites:', err);
      alert('Failed to add to favorites. Please try again.');
    }
  };

  const handleRemoveFromFavorites = async () => {
    if (!stock) return;
    
    try {
      await stockApi.removeFavorite(stock.symbol);
      setIsFavorite(false);
    } catch (err) {
      console.error('Error removing from favorites:', err);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="stock-details-loading">
        <div className="spinner"></div>
        <p>Loading stock details...</p>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="stock-details-error">
        <h2>Error</h2>
        <p>{error || 'Failed to load stock details.'}</p>
        <div className="stock-details-actions">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Go Back
          </button>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Format market cap
  const formatMarketCap = (marketCap: string) => {
    const cap = parseInt(marketCap, 10);
    if (cap >= 1e12) {
      return (cap / 1e12).toFixed(2) + ' T';
    } else if (cap >= 1e9) {
      return (cap / 1e9).toFixed(2) + ' B';
    } else if (cap >= 1e6) {
      return (cap / 1e6).toFixed(2) + ' M';
    } else {
      return cap.toLocaleString();
    }
  };

  // Remove % sign and convert to number for comparison
  const percentValue = parseFloat(stock.changePercent.replace('%', ''));
  const isPositiveChange = percentValue >= 0;

  return (
    <div className="stock-details">
      <div className="stock-details-header">
        <button onClick={() => navigate(-1)} className="btn btn-secondary back-button">
          &larr; Back to Dashboard
        </button>
      </div>
      
      <div className="stock-details-card">
        <div className="stock-details-title">
          <h1>{stock.symbol}</h1>
          <h2>{stock.companyName}</h2>
          <div className="stock-industry">{stock.industry}</div>
        </div>
        
        <div className="stock-price-container">
          <div className="stock-current-price">${stock.price.toFixed(2)}</div>
          <div className={`stock-price-change ${isPositiveChange ? 'positive' : 'negative'}`}>
            {isPositiveChange ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)} ({stock.changePercent})
          </div>
        </div>
        
        <div className="stock-metrics">
          <div className="metric">
            <div className="metric-label">P/E Ratio</div>
            <div className="metric-value">{stock.pe ? stock.pe.toFixed(2) : 'N/A'}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Market Cap</div>
            <div className="metric-value">{formatMarketCap(stock.marketCap)}</div>
          </div>
        </div>
        
        <div className="stock-description">
          <h3>About {stock.companyName}</h3>
          <p>{stock.description}</p>
        </div>
        
        <div className="stock-details-actions">
          {isFavorite ? (
            <button onClick={handleRemoveFromFavorites} className="btn btn-danger">
              Remove from Favorites
            </button>
          ) : (
            <button onClick={handleAddToFavorites} className="btn btn-primary">
              Add to Favorites
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetails;
