// src/services/streamingService.js - Fetch movies and shows with streaming availability
import tmdbApi from './tmdbApi';
import { TMDB_IMAGE_BASE_URL } from '../utils/constants';

class StreamingService {
  constructor() {
    this.cache = new Map();
  }

  formatMediaWithStreaming(media, isShow = false) {
    return {
      ...media,
      poster_path: media.poster_path ? `${TMDB_IMAGE_BASE_URL}${media.poster_path}` : null,
      backdrop_path: media.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${media.backdrop_path}` : null,
      year: isShow 
        ? (media.first_air_date?.split('-')[0] || 'Unknown')
        : (media.release_date?.split('-')[0] || 'Unknown'),
      rating: media.vote_average ? parseFloat(media.vote_average).toFixed(1) : 'N/A',
      title: media.name || media.title,
      genres: media.genres || [], // Include genres from the API
      isShow: isShow
    };
  }

  async fetchBestMoviesGlobally() {
    const cacheKey = 'best_movies_global';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const allMovies = [];

      // Fetch top-rated movies globally
      console.log(`🌟 Fetching best-rated movies globally...`);
      for (let page = 1; page <= 5; page++) {
        const response = await tmdbApi.getTopRatedMovies(page);
        
        if (response.results && response.results.length > 0) {
          const formattedMovies = response.results.map(movie => this.formatMediaWithStreaming(movie, false));
          allMovies.push(...formattedMovies);
        }

        if (page >= response.total_pages) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Fetch trending movies
      console.log(`🔥 Fetching trending movies...`);
      for (let page = 1; page <= 3; page++) {
        const response = await tmdbApi.getTrendingMovies('week', page);
        
        if (response.results && response.results.length > 0) {
          const formattedMovies = response.results.map(movie => this.formatMediaWithStreaming(movie, false));
          allMovies.push(...formattedMovies);
        }

        if (page >= response.total_pages) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Get streaming info for each movie
      console.log(`📺 Fetching streaming availability for ${allMovies.length} movies...`);
      const moviesWithStreaming = await Promise.all(
        allMovies.map(async (movie) => {
          try {
            const streamingInfo = await tmdbApi.getMovieStreamingInfo(movie.id);
            return {
              ...movie,
              streaming: streamingInfo
            };
          } catch (error) {
            return {
              ...movie,
              streaming: null
            };
          }
        })
      );

      // Remove duplicates and sort by rating
      const uniqueMovies = this.removeDuplicates(moviesWithStreaming);
      const sortedMovies = uniqueMovies.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

      this.cache.set(cacheKey, sortedMovies);
      return sortedMovies;

    } catch (error) {
      console.error('Error fetching best movies globally:', error);
      return [];
    }
  }

  async fetchBestShowsGlobally() {
    const cacheKey = 'best_shows_global';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const allShows = [];

      // Fetch top-rated shows globally
      console.log(`🌟 Fetching best-rated shows globally...`);
      for (let page = 1; page <= 5; page++) {
        const response = await tmdbApi.getTopRatedShows(page);
        
        if (response.results && response.results.length > 0) {
          const formattedShows = response.results.map(show => this.formatMediaWithStreaming(show, true));
          allShows.push(...formattedShows);
        }

        if (page >= response.total_pages) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Fetch trending shows
      console.log(`🔥 Fetching trending shows...`);
      for (let page = 1; page <= 3; page++) {
        const response = await tmdbApi.getTrendingShows('week', page);
        
        if (response.results && response.results.length > 0) {
          const formattedShows = response.results.map(show => this.formatMediaWithStreaming(show, true));
          allShows.push(...formattedShows);
        }

        if (page >= response.total_pages) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Get streaming info for each show
      console.log(`📺 Fetching streaming availability for ${allShows.length} shows...`);
      const showsWithStreaming = await Promise.all(
        allShows.map(async (show) => {
          try {
            const streamingInfo = await tmdbApi.getShowStreamingInfo(show.id);
            return {
              ...show,
              streaming: streamingInfo
            };
          } catch (error) {
            return {
              ...show,
              streaming: null
            };
          }
        })
      );

      // Remove duplicates and sort by rating
      const uniqueShows = this.removeDuplicates(showsWithStreaming);
      const sortedShows = uniqueShows.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

      this.cache.set(cacheKey, sortedShows);
      return sortedShows;

    } catch (error) {
      console.error('Error fetching best shows globally:', error);
      return [];
    }
  }

  removeDuplicates(media) {
    const seen = new Set();
    return media.filter(item => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }

  getStreamingPlatforms(streamingData) {
    if (!streamingData) return [];

    const platforms = [];

    // Check different regions for availability
    if (streamingData.results) {
      const regionData = streamingData.results.US || streamingData.results.IN || Object.values(streamingData.results)[0];
      
      if (regionData && regionData.flatrate) {
        platforms.push(...regionData.flatrate.map(provider => provider.provider_name));
      }
    }

    return [...new Set(platforms)]; // Remove duplicates
  }
}

const streamingService = new StreamingService();
export default streamingService;
