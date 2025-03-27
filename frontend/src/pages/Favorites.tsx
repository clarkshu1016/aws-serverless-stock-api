import React, { useEffect, useState } from 'react';
import { stockApi } from '../utils/api';
import StockCard from '../components/StockCard';
import '../styles/Favorites.css';

interface FavoriteStock {
  symbol: string;
  companyName: string;
  price?: number;
  change?: number;
  changePercent?: string;
  isLoading?: boolean;
}

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteStock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user favorites
        const favoritesResponse = await stockApi.getFavorites();
        const favoritesList = favoritesResponse.favorites || [];
        
        // Initialize favorites with loading state
        const initialFavorites = favoritesList.map((fav: any) => ({
          symbol: fav.symbol,
          companyName: fav.companyName || fav.symbol,
          isLoading: true,
        }));
        
        setFavorites(initialFavorites);
        
        // Fetch current stock data for each favorite
        for (const fav of initialFavorites) {
          try {
            const stockData = await stockApi.getStockBySymbol(fav.symbol);
            
            setFavorites(currentFavorites => 
              currentFavorites.map(cf => 
                cf.symbol === fav.symbol
                  ? {
                      ...cf,
                      price: stockData.price,
                      change: stockData.change,
                      changePercent: stockData.changePercent,
                      isLoading: false,
                    }
                  : cf
              )
            );
          } catch (err) {
            console.error(`Error fetching data for ${fav.symbol}:`, err);
            
            setFavorites(currentFavorites => 
              currentFavorites.map(cf => 
                cf.symbol === fav.symbol
                  ? {
                      ...cf,
                      isLoading: false,
                    }
                  : cf
              )
            );
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load your favorite stocks. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFromFavorites = async (symbol: string) => {
    try {
      await stockApi.removeFavorite(symbol);
      setFavorites(favorites.filter(fav => fav.symbol !== symbol));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  if (isLoading && favorites.length === 0) {
    return (
      <div className="favorites-loading">
        <div className="spinner"></div>
        <p>Loading your favorite stocks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="favorites">
      <div className="favorites-header">
        <h1>Your Favorite Stocks</h1>
      </div>
      
      {favorites.length === 0 ? (
        <div className="no-favorites">
          <p>You don't have any favorite stocks yet.</p>
          <p>Add stocks to your favorites from the dashboard.</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((stock) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              price={stock.price || 0}
              change={stock.change || 0}
              changePercent={stock.changePercent || '0%'}
              companyName={stock.companyName}
              isFavorite={true}
              onRemoveFromFavorites={() => handleRemoveFromFavorites(stock.symbol)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
