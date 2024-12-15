const apiKey = 'cdd2ea54ef813e5bc2bb7f305107f9df';
const forecastContainer = document.getElementById('forecast-cards');

const map = L.map('map').setView([13.0827, 80.2707], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const conditionImages = {
  Clear: 'Images/sunny.png',
  Clouds: 'Images/cloudy.png',
  Rain: 'Images/rainy.png',
  Snow: 'Images/snowy.png',
  Thunderstorm: 'Images/storm.png',
  Drizzle: 'Images/drizzle.png', 
  Mist: 'Images/mist.png',
};

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

function filterDailyForecast(forecasts) {
    const dailyForecast = [];
    const selectedDays = new Set();
  
    forecasts.forEach((forecast) => {
      const forecastDate = new Date(forecast.dt_txt).getDate();
      const forecastHour = new Date(forecast.dt_txt).getHours();
  
      if (
        !selectedDays.has(forecastDate) &&
        (forecastHour === 9 || forecastHour === 12 || forecastHour === 15)
      ) {
        dailyForecast.push(forecast);
        selectedDays.add(forecastDate);
      }
    });
  
    return dailyForecast.slice(0, 5); 
  }
  
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

function updateMap(lat, lon) {
  map.setView([lat, lon], 10);
  L.marker([lat, lon]).addTo(map).bindPopup('Weather Location').openPopup();
}

document.getElementById('fetch-button').addEventListener('click', fetchWeather);
document.getElementById('city-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') fetchWeather();
});