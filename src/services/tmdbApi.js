// src/services/tmdbApi.js (Complete File)
import axios from 'axios';
import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from '../utils/constants';

class TMDbService {
  constructor() {
    this.accessToken = TMDB_ACCESS_TOKEN;
    this.baseUrl = TMDB_BASE_URL;
    
    // Create axios instance with default headers
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Get movies by country with detailed logging
  async getMoviesByCountry(countryCode, page = 1) {
    try {
      console.log(`🔍 TMDb API Call: Country=${countryCode}, Page=${page}`);
      
      const response = await this.api.get('/discover/movie', {
        params: {
          with_origin_country: countryCode,
          page: page,
          sort_by: 'popularity.desc',
          'vote_count.gte': 5,
          include_adult: false
        }
      });
      
      console.log(`📊 API Response for ${countryCode}:`, {
        total_results: response.data.total_results,
        total_pages: response.data.total_pages,
        results_count: response.data.results?.length || 0,
        first_few_movies: response.data.results?.slice(0, 3).map(m => m.title) || []
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ TMDb API Error:', error.response?.data || error.message);
      return { results: [], total_pages: 0 };
    }
  }

  // Get movies by country and specific year
  async getMoviesByCountryAndYear(countryCode, year, page = 1) {
    try {
      const response = await this.api.get('/discover/movie', {
        params: {
          with_origin_country: countryCode,
          primary_release_year: year,
          page: page,
          sort_by: 'popularity.desc',
          'vote_count.gte': 5
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movies by country and year:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Get detailed movie information by movie ID
  async getMovieDetails(movieId) {
    try {
      const response = await this.api.get(`/movie/${movieId}`, {
        params: {
          append_to_response: 'credits,keywords,release_dates'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  }

  // Get all available movie genres
  async getGenres() {
    try {
      const response = await this.api.get('/genre/movie/list');
      console.log('✅ Fetched genres:', response.data.genres?.length || 0);
      return response.data.genres;
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  }

  // Get popular movies by country (using vote average)
  async getPopularMoviesByCountry(countryCode, page = 1) {
    try {
      const response = await this.api.get('/discover/movie', {
        params: {
          with_origin_country: countryCode,
          page: page,
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Get popular movies by region (alternative method)
  async getPopularMoviesByRegion(regionCode, page = 1) {
    try {
      const response = await this.api.get('/movie/popular', {
        params: {
          region: regionCode,
          page: page
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular movies by region:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Search movies by query string
  async searchMovies(query, page = 1) {
    try {
      const response = await this.api.get('/search/movie', {
        params: {
          query: query,
          page: page
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Get movies by original language (fallback method)
  async getMoviesByLanguage(languageCode, page = 1) {
    try {
      console.log(`🌐 Fetching movies by language: ${languageCode}`);
      const response = await this.api.get('/discover/movie', {
        params: {
          with_original_language: languageCode,
          page: page,
          sort_by: 'popularity.desc',
          'vote_count.gte': 10
        }
      });
      console.log(`✅ Language ${languageCode}: ${response.data.results?.length || 0} movies`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movies by language ${languageCode}:`, error);
      return { results: [], total_pages: 0 };
    }
  }

  // Get movies by decade range
  async getMoviesByDecade(startYear, endYear, page = 1) {
    try {
      const response = await this.api.get('/discover/movie', {
        params: {
          'primary_release_date.gte': `${startYear}-01-01`,
          'primary_release_date.lte': `${endYear}-12-31`,
          page: page,
          sort_by: 'popularity.desc'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movies by decade:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Test API connection
  async testConnection() {
    try {
      await this.api.get('/configuration');
      console.log('✅ TMDb API connection successful');
      return true;
    } catch (error) {
      console.error('❌ TMDb API connection failed:', error.response?.data || error.message);
      return false;
    }
  }

  // Get movie credits (cast and crew)
  async getMovieCredits(movieId) {
    try {
      const response = await this.api.get(`/movie/${movieId}/credits`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movie credits:', error);
      return { cast: [], crew: [] };
    }
  }

  // Get similar movies
  async getSimilarMovies(movieId, page = 1) {
    try {
      const response = await this.api.get(`/movie/${movieId}/similar`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching similar movies:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Get movie recommendations
  async getMovieRecommendations(movieId, page = 1) {
    try {
      const response = await this.api.get(`/movie/${movieId}/recommendations`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie recommendations:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Advanced discover with multiple filters
  async discoverMovies(filters = {}, page = 1) {
    try {
      const params = {
        page,
        ...filters
      };
      
      const response = await this.api.get('/discover/movie', { params });
      return response.data;
    } catch (error) {
      console.error('Error with advanced movie discovery:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // ========== TV SHOWS METHODS ==========
  
  // Get TV shows by country
  async getShowsByCountry(countryCode, page = 1) {
    try {
      console.log(`🔍 TMDb API Call: TV Shows Country=${countryCode}, Page=${page}`);
      
      const response = await this.api.get('/discover/tv', {
        params: {
          with_origin_country: countryCode,
          page: page,
          sort_by: 'popularity.desc',
          'vote_count.gte': 5,
          include_adult: false
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ TMDb API Error:', error.response?.data || error.message);
      return { results: [], total_pages: 0 };
    }
  }

  // Get highly-rated TV shows by country
  async getPopularShowsByCountry(countryCode, page = 1) {
    try {
      const response = await this.api.get('/discover/tv', {
        params: {
          with_origin_country: countryCode,
          page: page,
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular TV shows:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Get TV shows by country and year
  async getShowsByCountryAndYear(countryCode, year, page = 1) {
    try {
      const response = await this.api.get('/discover/tv', {
        params: {
          with_origin_country: countryCode,
          first_air_date_year: year,
          page: page,
          sort_by: 'popularity.desc',
          'vote_count.gte': 5
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching TV shows by country and year:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Get TV genres
  async getTVGenres() {
    try {
      const response = await this.api.get('/genre/tv/list');
      console.log('✅ Fetched TV genres:', response.data.genres?.length || 0);
      return response.data.genres;
    } catch (error) {
      console.error('Error fetching TV genres:', error);
      return [];
    }
  }

  // Get TV show details
  async getShowDetails(showId) {
    try {
      const response = await this.api.get(`/tv/${showId}`, {
        params: {
          append_to_response: 'credits,keywords'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching show details:', error);
      return null;
    }
  }

  // Get TV shows by original language
  async getShowsByLanguage(languageCode, page = 1) {
    try {
      console.log(`🌐 Fetching TV shows by language: ${languageCode}`);
      const response = await this.api.get('/discover/tv', {
        params: {
          with_original_language: languageCode,
          page: page,
          sort_by: 'popularity.desc',
          'vote_count.gte': 10
        }
      });
      console.log(`✅ Language ${languageCode}: ${response.data.results?.length || 0} shows`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching TV shows by language ${languageCode}:`, error);
      return { results: [], total_pages: 0 };
    }
  }

  // ========== GLOBAL/STREAMING METHODS ==========

  // Get top-rated movies globally
  async getTopRatedMovies(page = 1) {
    try {
      const response = await this.api.get('/movie/top_rated', {
        params: {
          page: page
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top-rated movies:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Get trending movies
  async getTrendingMovies(timeWindow = 'week', page = 1) {
    try {
      const response = await this.api.get(`/trending/movie/${timeWindow}`, {
        params: {
          page: page
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Get streaming availability for a movie
  async getMovieStreamingInfo(movieId) {
    try {
      const response = await this.api.get(`/movie/${movieId}/watch/providers`);
      return response.data;
    } catch (error) {
      console.warn(`Could not fetch streaming info for movie ${movieId}:`, error.message);
      return null;
    }
  }

  // Get trending TV shows
  async getTrendingShows(timeWindow = 'week', page = 1) {
    try {
      const response = await this.api.get(`/trending/tv/${timeWindow}`, {
        params: {
          page: page
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending shows:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Get top-rated TV shows
  async getTopRatedShows(page = 1) {
    try {
      const response = await this.api.get('/tv/top_rated', {
        params: {
          page: page
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top-rated shows:', error);
      return { results: [], total_pages: 0 };
    }
  }

  // Get streaming availability for a TV show
  async getShowStreamingInfo(showId) {
    try {
      const response = await this.api.get(`/tv/${showId}/watch/providers`);
      return response.data;
    } catch (error) {
      console.warn(`Could not fetch streaming info for show ${showId}:`, error.message);
      return null;
    }
  }
}

const tmdbApi = new TMDbService();
export default tmdbApi;
