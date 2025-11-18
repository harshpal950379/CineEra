import React, { useMemo } from 'react';
import { DECADES } from '../utils/constants';
import MovieCard from './MovieCard';

const TimelineViewShows = ({ shows, selectedGenres, selectedCountry }) => {
  const safeShows = useMemo(() => shows || {}, [shows]);
  const totalShows = useMemo(() => {
    return Object.values(safeShows).reduce((sum, decade) => {
      return sum + (Array.isArray(decade) ? decade.length : 0);
    }, 0);
  }, [safeShows]);
  
  return (
    <div className="timeline-view">
      <div className="timeline-header">
        <h2>Web Shows & TV Series of {selectedCountry} Through the Decades</h2>
        <p className="total-movies">Displaying {totalShows} shows</p>
        {selectedGenres && selectedGenres.length > 0 && (
          <p className="active-filters">
            Filtered by: {selectedGenres.join(', ')}
          </p>
        )}
      </div>
      
      <div className="timeline-container">
        {DECADES.map(decade => {
          const decadeShows = safeShows[decade] || [];
          
          if (decadeShows.length === 0) {
            return (
              <div key={decade} className="decade-section empty">
                <div className="decade-header">
                  <h3>{decade}</h3>
                  <span className="movie-count">0 shows</span>
                </div>
                <p className="no-movies-decade">
                  No shows found for this decade
                </p>
              </div>
            );
          }
          
          return (
            <div key={decade} className="decade-section">
              <div className="decade-header">
                <h3>{decade}</h3>
                <span className="movie-count">{decadeShows.length} shows</span>
              </div>
              
              <div className="movies-grid">
                {decadeShows.map((show, index) => (
                  <MovieCard 
                    key={show.id || `${decade}-${index}`} 
                    movie={show} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {totalShows === 0 && (
        <div className="no-movies">
          <h3>No shows found</h3>
          <p>Try selecting a different country or adjusting your genre filters.</p>
          <p>Some countries may have limited data in our database.</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(TimelineViewShows);
