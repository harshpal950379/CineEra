import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('cineera-watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  const addToWatchlist = (movie) => {
    setWatchlist(prevWatchlist => {
      // Prevent duplicates
      if (prevWatchlist.some(m => m.id === movie.id)) {
        return prevWatchlist;
      }
      const newWatchlist = [...prevWatchlist, movie];
      localStorage.setItem('cineera-watchlist', JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  };

  const removeFromWatchlist = (movieId) => {
    setWatchlist(prevWatchlist => {
      const newWatchlist = prevWatchlist.filter(movie => movie.id !== movieId);
      localStorage.setItem('cineera-watchlist', JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  };

  const isInWatchlist = (movieId) => {
    return watchlist.some(movie => movie.id === movieId);
  };

  return (
    <WatchlistContext.Provider 
      value={{ 
        watchlist, 
        addToWatchlist, 
        removeFromWatchlist, 
        isInWatchlist 
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider');
  }
  return context;
};
