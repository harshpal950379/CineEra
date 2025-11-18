// src/components/WatchlistPanel.jsx
import React, { useState } from 'react';
import { useWatchlist } from '../contexts/WatchlistContext';
import MovieCard from './MovieCard';

const WatchlistPanel = () => {
  const { watchlist } = useWatchlist();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="watchlist-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        📋 Watchlist ({watchlist.length})
      </button>
      
      {isOpen && (
        <div className="watchlist-panel">
          <div className="watchlist-header">
            <h3>My Watchlist</h3>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="watchlist-content">
            {watchlist.length === 0 ? (
              <p>Your watchlist is empty. Add some movies!</p>
            ) : (
              <div className="watchlist-movies">
                {watchlist.map(movie => (
                  <div key={movie.id} className="watchlist-movie-item">
                    <MovieCard movie={movie} isInWatchlistView={true} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WatchlistPanel;
