export default function WeatherInfo({ data }) {
    return (
      <div className="weather-info">
        <h2>{data.name}</h2>
        <img
          src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
          alt="Weather icon"
        />
        <p>Temperature: {data.main.temp}°C</p>
        <p>Feels like: {data.main.feels_like}°C</p>
        <p>Humidity: {data.main.humidity}%</p>
        <p>Wind speed: {data.wind.speed} m/s</p>
      </div>
    );
  }