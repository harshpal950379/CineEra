// src/hooks/useMovieData.js
import { useState, useEffect } from 'react';
import movieDataService from '../services/movieDataService';

export const useMovieData = (selectedCountry) => {
  const [movies, setMovies] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedCountry) return;

    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const movieData = await movieDataService.fetchMoviesForCountry(selectedCountry);
        setMovies(movieData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedCountry]);

  return { movies, loading, error };
};
