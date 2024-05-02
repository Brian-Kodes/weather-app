import React, { useState, useEffect } from 'react';

const LocationForm = ({ onSubmit }) => {
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSuggestions = async (query) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch location suggestions');
      }
      const data = await response.json();
      if (data && data.results && data.results.length > 0) {
        const suggestions = data.results.map(result => ({
          name: result.name,
          country: result.country
        }));
        setSuggestions(suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setError('Failed to fetch location suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.trim() !== '') {
      fetchSuggestions(location);
    } else {
      setSuggestions([]);
    }
  }, [location]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(location);
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(`${suggestion.name}, ${suggestion.country}`);
    setSuggestions([]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        className="search-bar"
        type="text"
        placeholder="Enter location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button type="submit" className="submit-btn">Get Weather</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>{`${suggestion.name}, ${suggestion.country}`}</li>
          ))}
        </ul>
      )}
    </form>
  );
};

export default LocationForm;
