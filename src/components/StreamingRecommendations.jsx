import React, { useState, useEffect, useMemo } from 'react';
import streamingService from '../services/streamingService';
import MovieCard from './MovieCard';

const StreamingRecommendations = ({ selectedGenres = [], selectedPlatform = 'all', onPlatformChange }) => {
  const [contentType, setContentType] = useState('movies'); // 'movies' or 'shows'
  const [recommendations, setRecommendations] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (contentType === 'movies') {
          data = await streamingService.fetchBestMoviesGlobally();
        } else {
          data = await streamingService.fetchBestShowsGlobally();
        }

        setRecommendations(data);

        // Extract available platforms
        const platforms = new Set();
        data.forEach(item => {
          const itemPlatforms = streamingService.getStreamingPlatforms(item.streaming);
          itemPlatforms.forEach(p => platforms.add(p));
        });
        setAvailablePlatforms(Array.from(platforms).sort());
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError('Failed to load recommendations');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [contentType]);

  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;

    // Filter by platform
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(item => {
        const platforms = streamingService.getStreamingPlatforms(item.streaming);
        return platforms.includes(selectedPlatform);
      });
    }

    // Filter by genres if selected
    if (selectedGenres && selectedGenres.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.genres || item.genres.length === 0) return false;
        // Check if at least one genre matches
        return selectedGenres.some(selectedGenre =>
          item.genres.some(itemGenre =>
            itemGenre.name?.toLowerCase() === selectedGenre.toLowerCase() ||
            itemGenre.id === selectedGenre
          )
        );
      });
    }

    return filtered;
  }, [recommendations, selectedPlatform, selectedGenres]);

  if (loading) {
    return (
      <div className="streaming-recommendations">
        <div className="loading-message">Loading best {contentType}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="streaming-recommendations">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Build title based on filters
  let titleSuffix = '';
  if (selectedGenres && selectedGenres.length > 0) {
    titleSuffix = ` (${selectedGenres.join(', ')})`;
  }
  if (selectedPlatform !== 'all') {
    titleSuffix += ` on ${selectedPlatform}`;
  }

  return (
    <div className="streaming-recommendations">
      <div className="streaming-header">
        <h2>🌟 Best Available on Streaming{titleSuffix}</h2>
        <p>Discover highly-rated content from around the world</p>
      </div>

      {/* Content Type Toggle */}
      <div className="content-type-toggle">
        <button
          className={`type-btn ${contentType === 'movies' ? 'active' : ''}`}
          onClick={() => setContentType('movies')}
        >
          🎬 Movies
        </button>
        <button
          className={`type-btn ${contentType === 'shows' ? 'active' : ''}`}
          onClick={() => setContentType('shows')}
        >
          📺 Shows & Series
        </button>
      </div>

      {/* Platform Filter */}
      <div className="platform-filter">
        <h3>Filter by Streaming Platform:</h3>
        <div className="platform-buttons">
          <button
            className={`platform-btn ${selectedPlatform === 'all' ? 'active' : ''}`}
            onClick={() => onPlatformChange('all')}
          >
            All Platforms ({recommendations.length})
          </button>
          {availablePlatforms.map(platform => {
            const count = recommendations.filter(item => {
              const platforms = streamingService.getStreamingPlatforms(item.streaming);
              return platforms.includes(platform);
            }).length;
            return (
              <button
                key={platform}
                className={`platform-btn ${selectedPlatform === platform ? 'active' : ''}`}
                onClick={() => onPlatformChange(platform)}
              >
                {platform} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="streaming-movies">
        <div className="movies-grid">
          {filteredRecommendations.length === 0 ? (
            <div className="no-results">
              <p>
                No {contentType} available
                {selectedGenres && selectedGenres.length > 0 ? ` in ${selectedGenres.join(', ')} genre` : ''}
                {selectedPlatform !== 'all' ? ` on ${selectedPlatform}` : ' on any streaming platform'}
              </p>
            </div>
          ) : (
            filteredRecommendations.slice(0, 20).map(item => (
              <div key={item.id} className="streaming-movie-card">
                <MovieCard
                  movie={{
                    id: item.id,
                    title: item.title,
                    poster_path: item.poster_path,
                    vote_average: item.rating,
                    release_date: item.year,
                    genres: item.genres || []
                  }}
                />
                {item.streaming && (
                  <div className="streaming-info">
                    <div className="platforms">
                      {streamingService.getStreamingPlatforms(item.streaming).map(platform => (
                        <span key={platform} className="platform-badge">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamingRecommendations;
