// src/components/GenreFilter.jsx
import React from 'react';
import { GENRES } from '../utils/constants';

const GenreFilter = ({ selectedGenres, onGenreChange }) => {
  const handleGenreToggle = (genre) => {
    if (selectedGenres.includes(genre)) {
      onGenreChange(selectedGenres.filter(g => g !== genre));
    } else {
      onGenreChange([...selectedGenres, genre]);
    }
  };

  return (
    <div className="genre-filter">
      <h3>Filter by Genre</h3>
      <div className="genre-buttons">
        {GENRES.map(genre => (
          <button
            key={genre}
            className={`genre-button ${selectedGenres.includes(genre) ? 'active' : ''}`}
            onClick={() => handleGenreToggle(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
      {selectedGenres.length > 0 && (
        <button 
          className="clear-filters"
          onClick={() => onGenreChange([])}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default GenreFilter;
