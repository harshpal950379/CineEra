// src/services/showDataService.js - Service for fetching and organizing TV shows
import tmdbApi from './tmdbApi';
import { COUNTRY_CODES, DECADES, TMDB_IMAGE_BASE_URL } from '../utils/constants';

class ShowDataService {
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

  formatShowData(show) {
    return {
      ...show,
      poster_path: show.poster_path ? `${TMDB_IMAGE_BASE_URL}${show.poster_path}` : null,
      backdrop_path: show.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${show.backdrop_path}` : null,
      decade: this.getDecadeFromYear(show.first_air_date?.split('-')[0] || '1900'),
      year: show.first_air_date?.split('-')[0] || 'Unknown',
      rating: show.vote_average ? parseFloat(show.vote_average).toFixed(1) : 'N/A',
      title: show.name // Normalize to use 'title' like movies
    };
  }

  async fetchShowsForCountry(countryName) {
    const countryCode = COUNTRY_CODES[countryName];
    if (!countryCode) {
      console.error(`Country code not found for: ${countryName}`);
      return {};
    }

    const cacheKey = `shows_country_${countryCode}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const allShows = [];
      const maxPages = 10; // Increased from 5 to 10

      // 1. Fetch popular shows by country
      console.log(`📺 Fetching popular shows for ${countryName}...`);
      for (let page = 1; page <= maxPages; page++) {
        const response = await tmdbApi.getShowsByCountry(countryCode, page);
        
        if (response.results && response.results.length > 0) {
          const formattedShows = response.results.map(show => this.formatShowData(show));
          allShows.push(...formattedShows);
        }

        if (page >= response.total_pages) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 2. Fetch highly-rated shows by country
      console.log(`⭐ Fetching highly-rated shows for ${countryName}...`);
      for (let page = 1; page <= 5; page++) {
        try {
          const response = await tmdbApi.getPopularShowsByCountry(countryCode, page);
          if (response.results && response.results.length > 0) {
            const formattedShows = response.results.map(show => this.formatShowData(show));
            allShows.push(...formattedShows);
          }
          if (page >= response.total_pages) break;
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Could not fetch highly-rated shows page ${page}:`, error.message);
        }
      }

      // 3. Fetch shows by decade range (1980-present)
      console.log(`📅 Fetching shows by decade for ${countryName}...`);
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
            const response = await tmdbApi.getShowsByCountryAndYear(countryCode, range.start, page);
            if (response.results && response.results.length > 0) {
              const formattedShows = response.results.map(show => this.formatShowData(show));
              allShows.push(...formattedShows);
            }
            if (page >= response.total_pages) break;
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            continue;
          }
        }
      }

      // 4. Language-based fallback
      if (allShows.length === 0) {
        console.log(`🌐 Trying language-based fallback for shows in ${countryName}...`);
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
            const langResponse = await tmdbApi.getShowsByLanguage(language, page);
            if (langResponse.results && langResponse.results.length > 0) {
              const formattedShows = langResponse.results.map(show => this.formatShowData(show));
              allShows.push(...formattedShows);
            }
            if (page >= langResponse.total_pages) break;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      const uniqueShows = this.removeDuplicates(allShows);
      console.log(`✅ Total unique shows fetched for ${countryName}: ${uniqueShows.length}`);
      
      const organizedShows = this.organizeByDecade(uniqueShows);
      
      this.cache.set(cacheKey, organizedShows);
      return organizedShows;

    } catch (error) {
      console.error('Error fetching shows for country:', error);
      return {};
    }
  }

  removeDuplicates(shows) {
    const seen = new Set();
    return shows.filter(show => {
      if (seen.has(show.id)) {
        return false;
      }
      seen.add(show.id);
      return true;
    });
  }

  organizeByDecade(shows) {
    const organized = {};
    
    DECADES.forEach(decade => {
      organized[decade] = [];
    });

    shows.forEach(show => {
      const decade = show.decade;
      if (organized[decade]) {
        organized[decade].push(show);
      }
    });

    Object.keys(organized).forEach(decade => {
      organized[decade].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    });

    return organized;
  }

  async filterByGenre(shows, selectedGenres) {
    if (!selectedGenres || selectedGenres.length === 0) {
      return shows;
    }

    try {
      if (!this.genreCache.has('tv_genres')) {
        const genres = await tmdbApi.getTVGenres();
        
        if (!genres || genres.length === 0) {
          return shows;
        }
        
        const genreMap = {};
        genres.forEach(genre => {
          genreMap[genre.name] = genre.id;
        });
        this.genreCache.set('tv_genres', genreMap);
      }

      const genreMap = this.genreCache.get('tv_genres');
      const selectedGenreIds = selectedGenres.map(genre => genreMap[genre]).filter(Boolean);
      
      if (selectedGenreIds.length === 0) {
        return shows;
      }

      const filtered = {};
      Object.keys(shows).forEach(decade => {
        filtered[decade] = shows[decade].filter(show => {
          if (!show.genre_ids || show.genre_ids.length === 0) return false;
          return selectedGenreIds.some(genreId => show.genre_ids.includes(genreId));
        });
      });

      return filtered;
    } catch (error) {
      console.error('Error filtering shows by genre:', error);
      return shows;
    }
  }

  async getShowDetailsById(showId) {
    try {
      const details = await tmdbApi.getShowDetails(showId);
      return details ? this.formatShowData(details) : null;
    } catch (error) {
      console.error('Error fetching show details:', error);
      return null;
    }
  }
}

const showDataService = new ShowDataService();
export default showDataService;
