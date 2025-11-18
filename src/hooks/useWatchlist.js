// src/hooks/useWatchlist.js
import { useState, useEffect } from 'react';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('cineera-watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  const addToWatchlist = (movie) => {
    // Prevent duplicates - check if movie already exists
    if (watchlist.some(m => m.id === movie.id)) {
      return; // Already in watchlist
    }
    const newWatchlist = [...watchlist, movie];
    setWatchlist(newWatchlist);
    localStorage.setItem('cineera-watchlist', JSON.stringify(newWatchlist));
  };

  const removeFromWatchlist = (movieId) => {
    const newWatchlist = watchlist.filter(movie => movie.id !== movieId);
    setWatchlist(newWatchlist);
    localStorage.setItem('cineera-watchlist', JSON.stringify(newWatchlist));
  };

  const isInWatchlist = (movieId) => {
    return watchlist.some(movie => movie.id === movieId);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist
  };
};
