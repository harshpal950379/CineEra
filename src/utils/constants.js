// src/utils/constants.js (With Environment Variable Fallback)

// TMDb API Credentials with fallback to direct values
export const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || '5c0f92fd782b3c479597420ea6b13837';
export const TMDB_ACCESS_TOKEN = process.env.REACT_APP_TMDB_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YzBmOTJmZDc4MmIzYzQ3OTU5NzQyMGVhNmIxMzgzNyIsIm5iZiI6MTc1Mzg2ODA5OC4wNzgsInN1YiI6IjY4ODllNzQyYjFiZWM2ZjY5YTU4MTI4ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9FAofrGIJ35O5JAiKo930iHb_mdP4jOmPKQHQWyPIBs';

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const DECADES = [
  '1980s', '1990s', '2000s', '2010s', '2020s'
];

export const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'TV Movie', 'Thriller', 'War', 'Western'
];

// TMDb uses ISO 3166-1 country codes
export const COUNTRY_CODES = {
  'United States': 'US',
  'United Kingdom': 'GB',
  'France': 'FR',
  'Germany': 'DE',
  'Japan': 'JP',
  'South Korea': 'KR',
  'India': 'IN',
  'China': 'CN',
  'Italy': 'IT',
  'Spain': 'ES',
  'Canada': 'CA',
  'Australia': 'AU',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Russia': 'RU',
  'Netherlands': 'NL',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Austria': 'AT',
  'Switzerland': 'CH',
  'Belgium': 'BE',
  'Portugal': 'PT',
  'Ireland': 'IE',
  'Greece': 'GR',
  'Turkey': 'TR',
  'Israel': 'IL',
  'Egypt': 'EG',
  'South Africa': 'ZA',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Thailand': 'TH',
  'Indonesia': 'ID',
  'Malaysia': 'MY',
  'Singapore': 'SG',
  'Philippines': 'PH',
  'Vietnam': 'VN',
  'Hong Kong': 'HK',
  'Taiwan': 'TW'
};

// Reverse mapping for display
export const CODE_TO_COUNTRY = Object.fromEntries(
  Object.entries(COUNTRY_CODES).map(([country, code]) => [code, country])
);

// Additional configuration with environment variable fallbacks
export const APP_CONFIG = {
  // API Configuration
  API_TIMEOUT: process.env.REACT_APP_API_TIMEOUT || 10000,
  API_RETRY_ATTEMPTS: process.env.REACT_APP_API_RETRY_ATTEMPTS || 3,
  
  // Application Settings
  DEFAULT_COUNTRY: process.env.REACT_APP_DEFAULT_COUNTRY || 'United States',
  MOVIES_PER_PAGE: process.env.REACT_APP_MOVIES_PER_PAGE || 20,
  MAX_PAGES_PER_COUNTRY: process.env.REACT_APP_MAX_PAGES_PER_COUNTRY || 5,
  
  // UI Settings
  ENABLE_DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true' || false,
  CACHE_DURATION: process.env.REACT_APP_CACHE_DURATION || 300000, // 5 minutes
};
