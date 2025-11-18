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
    if (yearNum >= 1970) return '1970s';
    if (yearNum >= 1960) return '1960s';
    if (yearNum >= 1950) return '1950s';
    if (yearNum >= 1940) return '1940s';
    if (yearNum >= 1930) return '1930s';
    return 'Earlier';
  }

  formatMovieData(movie) {
    return {
      ...movie,
      poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
      backdrop_path: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}` : null,
      decade: this.getDecadeFromYear(movie.release_date?.split('-')[0] || '1900'),
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
      const maxPages = 10; // Increased from 5 to 10 for better coverage

      // 1. Fetch popular movies by country (primary source)
      console.log(`📽️ Fetching popular movies for ${countryName}...`);
      for (let page = 1; page <= maxPages; page++) {
        const response = await tmdbApi.getMoviesByCountry(countryCode, page);
        
        if (response.results && response.results.length > 0) {
          const formattedMovies = response.results.map(movie => this.formatMovieData(movie));
          allMovies.push(...formattedMovies);
        }

        if (page >= response.total_pages) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 2. Fetch highly-rated movies by country (different sort)
      console.log(`⭐ Fetching highly-rated movies for ${countryName}...`);
      for (let page = 1; page <= 5; page++) {
        try {
          const response = await tmdbApi.getPopularMoviesByCountry(countryCode, page);
          if (response.results && response.results.length > 0) {
            const formattedMovies = response.results.map(movie => this.formatMovieData(movie));
            allMovies.push(...formattedMovies);
          }
          if (page >= response.total_pages) break;
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Could not fetch highly-rated movies page ${page}:`, error.message);
        }
      }

      // 3. Fetch movies by decade range (1980-present) for better coverage
      console.log(`📅 Fetching movies by decade for ${countryName}...`);
      const currentYear = new Date().getFullYear();
      const yearRanges = [
        { start: 1980, end: 1989 },
        { start: 1990, end: 1999 },
        { start: 2000, end: 2009 },
        { start: 2010, end: 2019 },
        { start: 2020, end: currentYear }
      ];

      for (const range of yearRanges) {
        // Fetch multiple pages per year range
        for (let page = 1; page <= 3; page++) {
          try {
            const response = await tmdbApi.getMoviesByCountryAndYear(countryCode, range.start, page);
            if (response.results && response.results.length > 0) {
              const formattedMovies = response.results.map(movie => this.formatMovieData(movie));
              allMovies.push(...formattedMovies);
            }
            if (page >= response.total_pages) break;
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            continue;
          }
        }
      }

      // 4. If still no movies, try language-based fallback
      if (allMovies.length === 0) {
        console.log(`🌐 Trying language-based fallback for ${countryName}...`);
        const languageMap = {
          'China': 'zh',
          'Japan': 'ja',
          'France': 'fr',
          'Germany': 'de',
          'South Korea': 'ko',
          'India': 'hi',
          'Spain': 'es',
          'Italy': 'it',
          'Russia': 'ru',
          'Brazil': 'pt'
        };
        
        const language = languageMap[countryName];
        if (language) {
          for (let page = 1; page <= 3; page++) {
            const langResponse = await tmdbApi.getMoviesByLanguage(language, page);
            if (langResponse.results && langResponse.results.length > 0) {
              const formattedMovies = langResponse.results.map(movie => this.formatMovieData(movie));
              allMovies.push(...formattedMovies);
            }
            if (page >= langResponse.total_pages) break;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      // Remove duplicates and organize by decade
      const uniqueMovies = this.removeDuplicates(allMovies);
      console.log(`✅ Total unique movies fetched for ${countryName}: ${uniqueMovies.length}`);
      
      const organizedMovies = this.organizeByDecade(uniqueMovies);
      
      this.cache.set(cacheKey, organizedMovies);
      return organizedMovies;

    } catch (error) {
      console.error('Error fetching movies for country:', error);
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
