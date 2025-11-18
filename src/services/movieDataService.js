// src/services/movieDataService.js (Production Clean Version)
import tmdbApi from './tmdbApi';
import { COUNTRY_CODES, DECADES, TMDB_IMAGE_BASE_URL } from '../utils/constants';

class MovieDataService {
  constructor() {
    this.cache = new Map();
    this.genreCache = new Map();
  }

  getDecadeFromYear(year) {
    const yearNum = parseInt(year);
    if (yearNum >= 2020) return '2020s';
    if (yearNum >= 2010) return '2010s';
    if (yearNum >= 2000) return '2000s';
    if (yearNum >= 1990) return '1990s';
    if (yearNum >= 1980) return '1980s';
    return null; // Filter out movies before 1980
  }

  formatMovieData(movie) {
    const decade = this.getDecadeFromYear(movie.release_date?.split('-')[0] || '1900');
    if (!decade) return null; // Skip movies before 1980
    
    return {
      ...movie,
      poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
      backdrop_path: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}` : null,
      decade: decade,
      year: movie.release_date?.split('-')[0] || 'Unknown',
      rating: movie.vote_average ? parseFloat(movie.vote_average).toFixed(1) : 'N/A'
    };
  }

  async fetchMoviesForCountry(countryName) {
    const countryCode = COUNTRY_CODES[countryName];
    if (!countryCode) {
      console.error(`Country code not found for: ${countryName}`);
      return {};
    }

    const cacheKey = `country_${countryCode}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const allMovies = [];
      const maxPages = 15; // Increased for better coverage

      // 1. Fetch popular movies by country (primary source)
      console.log(`📽️ Fetching popular movies for ${countryName}...`);
      for (let page = 1; page <= maxPages; page++) {
        const response = await tmdbApi.getMoviesByCountry(countryCode, page);
        
        if (response.results && response.results.length > 0) {
          const formattedMovies = response.results.map(movie => this.formatMovieData(movie)).filter(Boolean);
          allMovies.push(...formattedMovies);
          console.log(`✅ Fetched ${formattedMovies.length} movies on page ${page}`);
        }

        if (!response.total_pages || page >= response.total_pages) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`📊 Total movies fetched for ${countryName}: ${allMovies.length}`);

      // Remove duplicates and organize by decade
      const uniqueMovies = this.removeDuplicates(allMovies);
      console.log(`✅ Unique movies after dedup: ${uniqueMovies.length}`);
      
      const organizedMovies = this.organizeByDecade(uniqueMovies);
      console.log(`📅 Organized into decades:`, Object.keys(organizedMovies).map(d => `${d}: ${organizedMovies[d].length}`));
      
      this.cache.set(cacheKey, organizedMovies);
      return organizedMovies;

    } catch (error) {
      console.error('❌ Error fetching movies for country:', error);
      return {};
    }
  }

  removeDuplicates(movies) {
    const seen = new Set();
    return movies.filter(movie => {
      if (seen.has(movie.id)) {
        return false;
      }
      seen.add(movie.id);
      return true;
    });
  }

  organizeByDecade(movies) {
    const organized = {};
    
    DECADES.forEach(decade => {
      organized[decade] = [];
    });

    movies.forEach(movie => {
      const decade = movie.decade;
      if (organized[decade]) {
        organized[decade].push(movie);
      }
    });

    // Sort movies within each decade by popularity
    Object.keys(organized).forEach(decade => {
      organized[decade].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    });

    return organized;
  }

  async filterByGenre(movies, selectedGenres) {
    if (!selectedGenres || selectedGenres.length === 0) {
      return movies;
    }

    try {
      // Get genre mapping
      if (!this.genreCache.has('genres')) {
        const genres = await tmdbApi.getGenres();
        
        if (!genres || genres.length === 0) {
          return movies;
        }
        
        const genreMap = {};
        genres.forEach(genre => {
          genreMap[genre.name] = genre.id;
        });
        this.genreCache.set('genres', genreMap);
      }

      const genreMap = this.genreCache.get('genres');
      const selectedGenreIds = selectedGenres.map(genre => genreMap[genre]).filter(Boolean);
      
      if (selectedGenreIds.length === 0) {
        return movies;
      }

      const filtered = {};
      Object.keys(movies).forEach(decade => {
        filtered[decade] = movies[decade].filter(movie => {
          if (!movie.genre_ids || movie.genre_ids.length === 0) return false;
          return selectedGenreIds.some(genreId => movie.genre_ids.includes(genreId));
        });
      });

      return filtered;
    } catch (error) {
      console.error('Error filtering by genre:', error);
      return movies;
    }
  }

  async getMovieDetailsById(movieId) {
    try {
      const details = await tmdbApi.getMovieDetails(movieId);
      return details ? this.formatMovieData(details) : null;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  }
}

const movieDataService = new MovieDataService();
export default movieDataService;
