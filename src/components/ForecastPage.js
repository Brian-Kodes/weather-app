import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faTemperatureHigh, faTemperatureLow, faCloudRain, faCloudSun, faCloudSunRain, faCloudShowersHeavy, faSun} from '@fortawesome/free-solid-svg-icons';

const ForecastPage = () => {
  const location = useLocation();
  const { forecastData } = location.state;
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  useEffect(() => {
    if (forecastData && forecastData.daily && forecastData.daily.time){
      const today = new Date();
      const startDate = new Date(forecastData.daily.time[0]); 
      const daysDifference = Math.floor((today - startDate) / (1000 * 3600 * 24)); 
      const currentWeek = Math.floor(daysDifference / 7);
      setCurrentWeekIndex(currentWeek >= 0 ? currentWeek : 0);
    }
  }, [forecastData]);

  const reorderForecastData = (data) => {
    const weeks = [];
    const firstDay = new Date(data[0]);
    let daysToMonday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Calculate days to Monday
  
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - daysToMonday);
  
    for (let i = 0; i < data.length; i += 7) {
      weeks.push(data.slice(i, i + 7));
    }
  
    return weeks;
  };

  const reorderedForecastData = forecastData && forecastData.daily && forecastData.daily.time
    ? reorderForecastData(forecastData.daily.time)
    : [];

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const options = {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      year: 'numeric',
      timeZone: forecastData.timezone,
    };
    const formattedDate = date.toLocaleString('en-US', options);
    const [dayMonth, time] = formattedDate.split(',');
    return { dayMonth, time };
  };

  const navigateGoBack = () => {
    navigate(-1);
  };

  const handleCardClick = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };
  
  const handleCardMouseLeave = () => {
    setHoveredCard(null);
  };

  const goToNextWeek = () => {
    if (currentWeekIndex < reorderedForecastData.length - 1){
      setCurrentWeekIndex(currentWeekIndex + 1);
      slideForecastContainer(-1);
    }
  };

  const goToPreviousWeek = () => {
    if (currentWeekIndex > 0)
    {
      setCurrentWeekIndex(currentWeekIndex - 1);
      slideForecastContainer(1);
    }
  };

  const slideForecastContainer = (direction) => {
    const forecastContainer = document.querySelector('.forecast-cards');
    const totalWidth = forecastContainer.scrollWidth;
    const singleWeekWidth = totalWidth / reorderedForecastData.length;
    const translation = direction === 1 ? -singleWeekWidth : singleWeekWidth;
    forecastContainer.style.transform = `translateX(${translation}px)`;
    
    requestAnimationFrame(() => {
      forecastContainer.style.transition = 'transform 0.5s ease-in-out';
      forecastContainer.style.transform = `translateX(0)`;
    });
    
    setTimeout(() => {
      forecastContainer.style.transition = 'none';
    }, 500); 
  };

  const renderForecastCards = () => {
    return reorderedForecastData[currentWeekIndex].map((time, index) => {
      const { dayMonth, time: formattedTime } = formatDateTime(time);
      const dataIndex = currentWeekIndex * 7 + index;
      const isHovered = hoveredCard === dataIndex;
      const isExpanded = expandedCard === dataIndex;
      return (
        <div
          className={`forecast-card ${isHovered ? 'hovered' : ''} ${isExpanded ? 'expanded' : ''} ${index === 6 ? 'sunday-card' : ''}`}
          key={dataIndex}
          onMouseEnter={() => setHoveredCard(dataIndex)}
          onMouseLeave={handleCardMouseLeave}
          onClick={() => handleCardClick(dataIndex)}
        >
          <h3 id='day-month'>{dayMonth}</h3>
          {isHovered && !isExpanded && (
            <p>
              <span className="subtext">{formattedTime}</span> <br />
              Max: {forecastData.daily.temperature_2m_max[dataIndex]}°C <FontAwesomeIcon icon={faTemperatureHigh} style={{ color: 'maroon' }} /><br />
              Min: {forecastData.daily.temperature_2m_min[dataIndex]}°C <FontAwesomeIcon icon={faTemperatureLow} style={{ color: 'blue' }} />
            </p>
          )}
          {isExpanded && (
            <div className="expanded-details">
              <p>
                <span className="subtext">{formattedTime}</span> <br />
                Max: {forecastData.daily.temperature_2m_max[dataIndex]}°C <FontAwesomeIcon icon={faTemperatureHigh} style={{ color: 'maroon' }} /><br />
                Min: {forecastData.daily.temperature_2m_min[dataIndex]}°C <FontAwesomeIcon icon={faTemperatureLow} style={{ color: 'blue' }} /><br />
                Precipitation Probability: {forecastData.daily.precipitation_probability_max[dataIndex]}% <FontAwesomeIcon icon={faCloudRain} style={{ color: 'purple' }} /><br />
                Precipitation: {forecastData.daily.precipitation_sum[dataIndex]}mm <FontAwesomeIcon icon={faCloudSunRain} /><br />
                Rain: {forecastData.daily.rain_sum[dataIndex]}mm <FontAwesomeIcon icon={faCloudShowersHeavy} style={{ color: 'grey' }} /> <br />
                UV Index: {forecastData.daily.uv_index_max[dataIndex]} <FontAwesomeIcon icon={faSun} style={{ color: 'orange' }} /> <br />
                UV Index (clear sky): {forecastData.daily.uv_index_clear_sky_max[dataIndex]} <FontAwesomeIcon icon={faCloudSun} style={{ color: 'yellow' }} /><br />
              </p>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="forecast-page">
      <div className="forecast-container" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
      <FontAwesomeIcon icon={faArrowLeft} className="back-btn" onClick={navigateGoBack} />
        <div className="forecast-header">
          <FontAwesomeIcon icon={faArrowLeft} className="navigate-btn" onClick={goToPreviousWeek} />
          <h2 id = "week-title">{currentWeekIndex === 1 ? 'This Week' : currentWeekIndex === 2  ? 'Next Week' : currentWeekIndex === 0 ? 'Previous Week' : '' }</h2>
          <FontAwesomeIcon icon={faArrowRight} className="navigate-btn" onClick={goToNextWeek} />
        </div>
        <div className = "forecast-cards">
          {renderForecastCards()}
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
