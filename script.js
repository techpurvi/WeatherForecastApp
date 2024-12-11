const apiKey = 'cdd2ea54ef813e5bc2bb7f305107f9df'; // Replace with your OpenWeatherMap API key
const forecastContainer = document.getElementById('forecast-cards');

// Initialize Map
const map = L.map('map').setView([13.0827, 80.2707], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const conditionImages = {
  Clear: 'images/sunny.png',
  Clouds: 'images/cloudy.png',
  Rain: 'images/rainy.png',
  Snow: 'images/snowy.png',
  Thunderstorm: 'images/storm.png',
  Drizzle: 'images/drizzle.png',
  Mist: 'images/mist.png',
};

// Fetch Weather Data
function fetchWeather() {
  const city = document.getElementById('city-input').value.trim();
  if (!city) return alert('Please enter a city name!');

  const apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

  forecastContainer.innerHTML = '<div class="spinner"></div>';

  fetch(apiURL)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === '200') {
        displayWeather(filterDailyForecast(data.list));
        updateMap(data.city.coord.lat, data.city.coord.lon);
      } else {
        forecastContainer.innerHTML = '<p>City not found!</p>';
      }
    })
    .catch(() => {
      forecastContainer.innerHTML = '<p>Something went wrong!</p>';
    });
}

// Filter to get daily forecasts
function filterDailyForecast(forecasts) {
    const dailyForecast = [];
    const selectedDays = new Set();
  
    forecasts.forEach((forecast) => {
      const forecastDate = new Date(forecast.dt_txt).getDate();
      const forecastHour = new Date(forecast.dt_txt).getHours();
  
      // Select the forecast around midday (12:00), fallback to close times if unavailable
      if (
        !selectedDays.has(forecastDate) &&
        (forecastHour === 9 || forecastHour === 12 || forecastHour === 15)
      ) {
        dailyForecast.push(forecast);
        selectedDays.add(forecastDate);
      }
    });
  
    return dailyForecast.slice(0, 5); // Return the first 5 days
  }
  
// Display Weather Data
function displayWeather(dailyForecast) {
  forecastContainer.innerHTML = '';
  dailyForecast.forEach((forecast) => {
    const { dt_txt, main, weather } = forecast;
    const condition = weather[0].main;
    const iconUrl = conditionImages[condition] || 'images/default.png';
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <h3>${new Date(dt_txt).toDateString()}</h3>
      <img src="${iconUrl}" alt="${weather[0].description}">
      <p>${main.temp}°C</p>
      <p>${weather[0].description}</p>
    `;
    forecastContainer.appendChild(card);
  });
}

// Update Map with New City Coordinates
function updateMap(lat, lon) {
  map.setView([lat, lon], 10);
  L.marker([lat, lon]).addTo(map).bindPopup('Weather Location').openPopup();
}

document.getElementById('fetch-button').addEventListener('click', fetchWeather);
document.getElementById('city-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') fetchWeather();
});