// src/components/MovieCard.jsx
import React, { useState, useEffect } from 'react';
import { useWatchlist } from '../contexts/WatchlistContext';
import streamingService from '../services/streamingService';
import tmdbApi from '../services/tmdbApi';

const MovieCard = ({ movie, isInWatchlistView = false, isShow = false }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [streamingPlatforms, setStreamingPlatforms] = useState([]);
  const [loadingStreaming, setLoadingStreaming] = useState(false);

  useEffect(() => {
    const fetchStreaming = async () => {
      setLoadingStreaming(true);
      try {
        let streamingInfo;
        if (isShow) {
          streamingInfo = await tmdbApi.getShowStreamingInfo(movie.id);
        } else {
          streamingInfo = await tmdbApi.getMovieStreamingInfo(movie.id);
        }
        const platforms = streamingService.getStreamingPlatforms(streamingInfo);
        setStreamingPlatforms(platforms);
      } catch (error) {
        console.error('Error fetching streaming info:', error);
        setStreamingPlatforms([]);
      } finally {
        setLoadingStreaming(false);
      }
    };

    fetchStreaming();
  }, [movie.id, isShow]);

  const handleWatchlistToggle = () => {
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className="movie-card-wrapper">
      <div className="movie-card">
        <div className="movie-poster">
          {!imageLoaded && !imageError && (
            <div className="poster-skeleton">Loading...</div>
          )}
          
          {!imageError ? (
            <img 
              src={movie.poster_path || '/placeholder-poster.jpg'}
              alt={movie.title}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
          ) : (
            <div className="poster-placeholder">
              <span>No Image</span>
            </div>
          )}
        </div>
        
        <div className="movie-info">
          <h4>{movie.title}</h4>
          <p className="movie-year">{movie.year}</p>
          <p className="movie-rating">⭐ {movie.rating}/10</p>
          
          {movie.overview && (
            <div className="movie-plot">
              <p>{movie.overview.substring(0, 300)}...</p>
            </div>
          )}
          
          <div className="movie-actions">
            {isInWatchlistView ? (
              <button 
                className="watchlist-btn remove-btn"
                onClick={() => removeFromWatchlist(movie.id)}
              >
                ✕ Remove from Watchlist
              </button>
            ) : (
              <button 
                className={`watchlist-btn ${isInWatchlist(movie.id) ? 'in-watchlist' : ''}`}
                onClick={handleWatchlistToggle}
              >
                {isInWatchlist(movie.id) ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </button>
            )}
            
            <a 
              href={`https://www.themoviedb.org/movie/${movie.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tmdb-link"
            >
              View on TMDb
            </a>
          </div>
        </div>
      </div>

      {/* Streaming Platforms Below Card */}
      {!loadingStreaming && streamingPlatforms.length > 0 && (
        <div className="card-streaming-info">
          <p className="streaming-info-label">📺 Available on:</p>
          <div className="platform-badges">
            {streamingPlatforms.map(platform => (
              <span key={platform} className="platform-badge">
                {platform}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(MovieCard);
