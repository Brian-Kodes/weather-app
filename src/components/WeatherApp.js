import React, { useState } from 'react';
import LocationForm from './LocationForm';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmitLocation = async (location) => {
    setLoading(true);
    setError(null);
  
    if (!location.trim()) {
      setError('Please enter a location.');
      setLoading(false);
      return;
    }

    try {
      const encodedLocation = encodeURIComponent(location);
      
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodedLocation}&count=1&language=en&format=json`
      );
      const data = await response.json();
      
      if (data && data.results && data.results.length > 0) {
        const { latitude, longitude, timezone } = data.results[0];
        const forecastResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=&daily=temperature_2m_max,temperature_2m_min,uv_index_max,uv_index_clear_sky_max,precipitation_sum,precipitation_probability_max,rain_sum,wind_speed_10m_max,&timezone=${timezone}&past_days=7&forecast_days=14`
        );
        const forecastData = await forecastResponse.json();
        setWeatherData(forecastData);
        navigate('/forecast', { state: { forecastData } });
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateGoBack = () => {
    navigate("/", {replace: true});
  };

  return (
    <div className="weather-app">
      <FontAwesomeIcon icon={faArrowLeft} className="back-btn" onClick={navigateGoBack} />
      {loading ? (
        <div className="loading-overlay">
          <FontAwesomeIcon icon={faCloud} className="cloud-icon" />
        </div>
      ) : (
        <div className="app-container">
          <h1 className="main-heading">Weather</h1>
          <h2 className="forecast">Forecast</h2>
          <div className="search-container">
            <LocationForm onSubmit={handleSubmitLocation} />
          </div>
          {error && <p>{error}</p>}
        </div>
      )}
    </div>
  );  
};

export default WeatherApp;
