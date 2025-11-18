import React, { useState } from 'react';
import tmdbApi from '../services/tmdbApi';

const ApiDebug = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      // Test 1: Connection
      console.log('Testing TMDb API connection...');
      const connectionTest = await tmdbApi.testConnection();
      console.log('Connection test:', connectionTest);
      
      // Test 2: Genres (this was failing before)
      console.log('Testing genres...');
      const genres = await tmdbApi.getGenres();
      console.log('Genres:', genres);
      
      // Test 3: Popular movies (should always work)
      console.log('Testing popular movies...');
      const popularResponse = await tmdbApi.api.get('/movie/popular');
      console.log('Popular movies:', popularResponse.data);
      
      // Test 4: US movies (should have results)
      console.log('Testing US movies...');
      const usMovies = await tmdbApi.getMoviesByCountry('US', 1);
      console.log('US movies:', usMovies);
      
      // Test 5: China movies
      console.log('Testing China movies...');
      const chinaMovies = await tmdbApi.getMoviesByCountry('CN', 1);
      console.log('China movies:', chinaMovies);
      
      setTestResult(`
        Connection: ${connectionTest ? 'SUCCESS' : 'FAILED'}
        Genres: ${genres?.length || 0} genres found
        Popular movies: ${popularResponse.data.results?.length || 0}
        US movies: ${usMovies.results?.length || 0}
        China movies: ${chinaMovies.results?.length || 0}
      `);
      
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#333', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px', 
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <button onClick={testApi} disabled={loading} style={{ 
        background: '#4ecdc4', 
        color: 'white', 
        border: 'none', 
        padding: '8px 12px', 
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        {loading ? 'Testing...' : 'Test TMDb API'}
      </button>
      {testResult && (
        <pre style={{ 
          fontSize: '11px', 
          marginTop: '10px', 
          whiteSpace: 'pre-wrap',
          background: '#222',
          padding: '8px',
          borderRadius: '4px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {testResult}
        </pre>
      )}
    </div>
  );
};

export default ApiDebug;
