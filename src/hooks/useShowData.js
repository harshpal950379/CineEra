import { useState, useEffect } from 'react';
import showDataService from '../services/showDataService';

export const useShowData = (countryName) => {
  const [shows, setShows] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!countryName) {
      setShows({});
      setError(null);
      return;
    }

    const fetchShows = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await showDataService.fetchShowsForCountry(countryName);
        setShows(data);
      } catch (err) {
        setError(err.message || 'Failed to load shows');
        setShows({});
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [countryName]);

  return { shows, loading, error };
};
