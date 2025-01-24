import { useState, useEffect } from 'react';
import WeatherInfo from './WeatherInfo';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const apiKey = 'd58ad4044ba68849b56063f5d052f234';

  // Fetch huidig weer
  const fetchWeather = async (e) => {
    e.preventDefault();
    fetchWeatherDirect(city);
  };

  // Haal weergegevens direct op zonder formulier
  const fetchWeatherDirect = async (city) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();
      setWeatherData(data);
      setSearchHistory((prev) => [...prev, city]);
      fetchForecast(data.coord.lat, data.coord.lon); // Haal voorspelling op basis van lat/lon
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  // Fetch 5-daagse voorspelling
  const fetchForecast = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();
      setForecastData(groupForecastByDay(data.list));
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  };

  // Groepeer voorspelling per dag
  const groupForecastByDay = (forecastList) => {
    const grouped = {};
    forecastList.forEach((item) => {
      const date = item.dt_txt.split(' ')[0]; // Haal de datum op
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return Object.entries(grouped).map(([date, items]) => ({
      date,
      items,
    }));
  };

  // Voeg toe aan favorieten
  const addToFavorites = () => {
    if (weatherData && !favorites.includes(weatherData.name)) {
      setFavorites((prev) => [...prev, weatherData.name]);
    }
  };

  // Verwijder uit favorieten
  const removeFromFavorites = (cityToRemove) => {
    setFavorites((prev) => prev.filter((city) => city !== cityToRemove));
  };

  // Haal weergegevens op voor een favoriet
  const handleFavoriteClick = (city) => {
    setCity(city); // Update de stad
    fetchWeatherDirect(city); // Haal direct weergegevens op
  };

  // Sla favorieten op in localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Laad favorieten in bij het starten
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavorites);
  }, []);

  // Dynamische achtergrond op basis van het weer
  const getBackgroundClass = (weather) => {
    if (!weather) return isDarkMode ? 'dark-default-bg' : 'default-bg';
    const mainWeather = weather.weather[0].main.toLowerCase();
    if (isDarkMode) {
      switch (mainWeather) {
        case 'clear':
          return 'dark-sunny-bg';
        case 'rain':
          return 'dark-rainy-bg';
        case 'clouds':
          return 'dark-cloudy-bg';
        case 'snow':
          return 'dark-snowy-bg';
        default:
          return 'dark-default-bg';
      }
    } else {
      switch (mainWeather) {
        case 'clear':
          return 'sunny-bg';
        case 'rain':
          return 'rainy-bg';
        case 'clouds':
          return 'cloudy-bg';
        case 'snow':
          return 'snowy-bg';
        default:
          return 'default-bg';
      }
    }
  };

  return (
    <div className={`App ${weatherData ? getBackgroundClass(weatherData) : isDarkMode ? 'dark-default-bg' : 'default-bg'}`}>
      <h1>Weather App</h1>
      <button className="mode-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <form onSubmit={fetchWeather} className="search-form">
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {weatherData && (
        <>
          <WeatherInfo data={weatherData} />
          <button className="favorite-button" onClick={addToFavorites}>⭐ Add to Favorites</button>
        </>
      )}

      <div className="forecast">
        <h3>7-Day Forecast</h3>
        <div className="forecast-cards">
          {forecastData.slice(0, 7).map((day, index) => (
            <div key={index} className="forecast-card">
              <h4>{new Date(day.date).toLocaleDateString()}</h4>
              <img
                src={`http://openweathermap.org/img/wn/${day.items[0].weather[0].icon}.png`}
                alt="Weather icon"
              />
              <p>Max: {Math.round(Math.max(...day.items.map((item) => item.main.temp_max)))}°C</p>
              <p>Min: {Math.round(Math.min(...day.items.map((item) => item.main.temp_min)))}°C</p>
            </div>
          ))}
        </div>
      </div>

      <div className="favorites">
        <h3>Favorites</h3>
        <ul>
          {favorites.map((city, index) => (
            <li key={index}>
              <span onClick={() => handleFavoriteClick(city)}>{city}</span>
              <button onClick={() => removeFromFavorites(city)}>🗑️ Remove</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="search-history">
        <h3>Search History</h3>
        <ul>
          {searchHistory.map((item, index) => (
            <li key={index} onClick={() => handleFavoriteClick(item)}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;