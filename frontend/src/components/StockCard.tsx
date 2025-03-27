import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/StockCard.css';

interface StockCardProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
  companyName?: string;
  onAddToFavorites?: () => void;
  onRemoveFromFavorites?: () => void;
  isFavorite?: boolean;
}

const StockCard: React.FC<StockCardProps> = ({
  symbol,
  price,
  change,
  changePercent,
  companyName,
  onAddToFavorites,
  onRemoveFromFavorites,
  isFavorite,
}) => {
  // Remove % sign and convert to number for comparison
  const percentValue = parseFloat(changePercent.replace('%', ''));
  const isPositiveChange = percentValue >= 0;

  return (
    <div className="stock-card">
      <div className="stock-card-header">
        <h3 className="stock-symbol">{symbol}</h3>
        {companyName && <div className="company-name">{companyName}</div>}
      </div>
      
      <div className="stock-price">${price.toFixed(2)}</div>
      
      <div className={`stock-change ${isPositiveChange ? 'positive' : 'negative'}`}>
        {isPositiveChange ? '▲' : '▼'} {Math.abs(change).toFixed(2)} ({changePercent})
      </div>
      
      <div className="stock-card-actions">
        <Link to={`/stock/${symbol}`} className="btn btn-secondary">Details</Link>
        
        {isFavorite !== undefined && (
          isFavorite ? (
            <button onClick={onRemoveFromFavorites} className="btn btn-danger">
              Remove
            </button>
          ) : (
            <button onClick={onAddToFavorites} className="btn btn-primary">
              Add to Favorites
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default StockCard;
