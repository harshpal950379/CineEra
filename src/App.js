// src/App.js (Clean Production Version)
import React, { useState, useEffect, lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import { useMovieData } from './hooks/useMovieData';
import { useShowData } from './hooks/useShowData';
import movieDataService from './services/movieDataService';
import showDataService from './services/showDataService';
import { COUNTRY_CODES } from './utils/constants';
import './styles/globals.css';

// Lazy-load larger components to reduce initial bundle size
const MapSelector = lazy(() => import('./components/MapSelector'));
const TimelineView = lazy(() => import('./components/TimelineView'));
const TimelineViewShows = lazy(() => import('./components/TimelineViewShows'));
const GenreFilter = lazy(() => import('./components/GenreFilter'));
const WatchlistPanel = lazy(() => import('./components/WatchlistPanel'));

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState({});
  const [filteredShows, setFilteredShows] = useState({});
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' or 'shows'
  const { movies, loading, error } = useMovieData(selectedCountry);
  const { shows, loading: showsLoading, error: showsError } = useShowData(selectedCountry);

  // Filter movies when genres change
  useEffect(() => {
    const filterMovies = async () => {
      if (Object.keys(movies).length > 0) {
        const filtered = await movieDataService.filterByGenre(movies, selectedGenres);
        setFilteredMovies(filtered);
      }
    };
    
    filterMovies();
  }, [movies, selectedGenres]);

  // Filter shows when genres change
  useEffect(() => {
    const filterShows = async () => {
      if (Object.keys(shows).length > 0) {
        const filtered = await showDataService.filterByGenre(shows, selectedGenres);
        setFilteredShows(filtered);
      }
    };
    
    filterShows();
  }, [shows, selectedGenres]);

  const handleCountrySelect = (countryName) => {
    // Check if country is supported
    if (COUNTRY_CODES[countryName]) {
      setSelectedCountry(countryName);
      setSelectedGenres([]); // Reset genre filters when changing country
    } else {
      console.warn(`Country not supported: ${countryName}`);
    }
  };

  const getSupportedCountries = () => {
    return Object.keys(COUNTRY_CODES);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌍 CineEra: The Timelined Map of World Cinema</h1>
        <p>Explore movies and web shows from around the world through different decades</p>
        <p className="subtitle">Powered by The Movie Database (TMDb)</p>
        <WatchlistPanel />
      </header>

      <main className="app-main">
        <section className="map-section">
          <h2>Select a Country</h2>
          <p className="supported-countries">
            Supported countries: {getSupportedCountries().length} available
          </p>
          <Suspense fallback={<LoadingSpinner message="Loading map..." />}>
            <MapSelector 
              onCountrySelect={handleCountrySelect}
              selectedCountry={selectedCountry}
              supportedCountries={getSupportedCountries()}
            />
          </Suspense>
        </section>

        {selectedCountry && (
          <section className="content-section">
            <div className="section-header">
              <h2>Cinema of {selectedCountry}</h2>
              
              <Suspense fallback={<div>Loading filters...</div>}>
                <GenreFilter 
                  selectedGenres={selectedGenres}
                  onGenreChange={setSelectedGenres}
                />
              </Suspense>
            </div>

            {/* Tabs for Movies and Shows */}
            <div className="content-tabs">
              <button 
                className={`tab-button ${activeTab === 'movies' ? 'active' : ''}`}
                onClick={() => setActiveTab('movies')}
              >
                🎬 Movies
              </button>
              <button 
                className={`tab-button ${activeTab === 'shows' ? 'active' : ''}`}
                onClick={() => setActiveTab('shows')}
              >
                📺 Web Shows & Series
              </button>
            </div>

            {/* Movies Tab */}
            {activeTab === 'movies' && (
              <>
                {loading && (
                  <LoadingSpinner 
                    message={`Discovering cinema from ${selectedCountry}...`} 
                  />
                )}
                
                {error && (
                  <div className="error-message">
                    <h3>Error loading movies</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>
                      Try Again
                    </button>
                  </div>
                )}

                {!loading && !error && Object.keys(filteredMovies).length > 0 && (
                  <Suspense fallback={<LoadingSpinner message="Loading timeline..." />}>
                    <TimelineView 
                      movies={filteredMovies}
                      selectedGenres={selectedGenres}
                      selectedCountry={selectedCountry}
                    />
                  </Suspense>
                )}

                {!loading && !error && Object.keys(filteredMovies).length === 0 && selectedCountry && (
                  <div className="no-movies">
                    <h3>No movies found</h3>
                    <p>Try selecting a different country or adjusting your genre filters.</p>
                    <p>Some countries may have limited data in our database.</p>
                  </div>
                )}
              </>
            )}

            {/* Shows Tab */}
            {activeTab === 'shows' && (
              <>
                {showsLoading && (
                  <LoadingSpinner 
                    message={`Discovering web shows from ${selectedCountry}...`} 
                  />
                )}
                
                {showsError && (
                  <div className="error-message">
                    <h3>Error loading shows</h3>
                    <p>{showsError}</p>
                    <button onClick={() => window.location.reload()}>
                      Try Again
                    </button>
                  </div>
                )}

                {!showsLoading && !showsError && Object.keys(filteredShows).length > 0 && (
                  <Suspense fallback={<LoadingSpinner message="Loading timeline..." />}>
                    <TimelineViewShows 
                      shows={filteredShows}
                      selectedGenres={selectedGenres}
                      selectedCountry={selectedCountry}
                    />
                  </Suspense>
                )}

                {!showsLoading && !showsError && Object.keys(filteredShows).length === 0 && selectedCountry && (
                  <div className="no-movies">
                    <h3>No web shows found</h3>
                    <p>Try selecting a different country or adjusting your genre filters.</p>
                    <p>Some countries may have limited data in our database.</p>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by The Movie Database (TMDb) API | Built with React & Leaflet</p>
        <p>This product uses the TMDb API but is not endorsed or certified by TMDb</p>
      </footer>
    </div>
  );
}

export default App;
