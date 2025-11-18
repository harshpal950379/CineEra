// src/components/TimelineView.jsx
import React, { useMemo } from 'react';
import { DECADES } from '../utils/constants';
import MovieCard from './MovieCard';

const TimelineView = ({ movies, selectedGenres, selectedCountry }) => {
  const safeMovies = useMemo(() => movies || {}, [movies]);
  const totalMovies = useMemo(() => {
    return Object.values(safeMovies).reduce((sum, decade) => {
      return sum + (Array.isArray(decade) ? decade.length : 0);
    }, 0);
  }, [safeMovies]);
  
  return (
    <div className="timeline-view">
      <div className="timeline-header">
        <h2>Cinema of {selectedCountry} Through the Decades</h2>
        <p className="total-movies">Displaying {totalMovies} films</p>
        {selectedGenres && selectedGenres.length > 0 && (
          <p className="active-filters">
            Filtered by: {selectedGenres.join(', ')}
          </p>
        )}
      </div>
      
      <div className="timeline-container">
        {DECADES.map(decade => {
          const decadeMovies = safeMovies[decade] || [];
          
          if (decadeMovies.length === 0) {
            return (
              <div key={decade} className="decade-section empty">
                <div className="decade-header">
                  <h3>{decade}</h3>
                  <span className="movie-count">0 films</span>
                </div>
                <p className="no-movies-decade">
                  No movies found for this decade
                </p>
              </div>
            );
          }
          
          return (
            <div key={decade} className="decade-section">
              <div className="decade-header">
                <h3>{decade}</h3>
                <span className="movie-count">{decadeMovies.length} films</span>
              </div>
              
              <div className="movies-grid">
                {decadeMovies.map((movie, index) => (
                  <MovieCard 
                    key={movie.id || `${decade}-${index}`} 
                    movie={movie} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {totalMovies === 0 && (
        <div className="no-movies">
          <h3>No movies found</h3>
          <p>Try selecting a different country or adjusting your genre filters.</p>
          <p>Some countries may have limited data in our database.</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(TimelineView);
