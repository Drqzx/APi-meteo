document.getElementById('search-button').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    getWeather(city);
});

function getWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=a950f5d15e54b182c392c864357ceae9&lang=fr`)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Ville incorrecte');
            }
            return response.json();
        })
        .then(function(data_weather) {
            var weather = data_weather.weather[0];
            var main = data_weather.main;
            var wind = data_weather.wind;
            printMessage(city, main.temp, weather.description, weather.icon, main.humidity, wind.speed);
        })
        .catch(function(error) {
            console.error(error);
            alert('Ville incorrecte 😉');
        });
}

function printMessage(city, temperature, description, icon, humidity, wind) {
    // Convertir la température de Kelvin à Celsius
    var temperatureCelsius = temperature - 273.15;

    // Mettre à jour les éléments de la page avec les nouvelles données
    document.getElementById('city-name').textContent = city;
    document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${icon}.png`;
    document.getElementById('temperature').textContent = `${temperatureCelsius.toFixed(2)}°C`;
    document.getElementById('description').textContent = description;
    document.getElementById('humidity').textContent = `Humidité : ${humidity}%`;
    document.getElementById('wind').textContent = `Vent : ${wind} km/h`;
}

// Get the input field
var input = document.getElementById("city-input");

// Execute a function when the user presses a key on the keyboard
input.addEventListener("keypress", function(event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("search-button").click();
  }
});

// Charger les données météo pour la ville initiale
getWeather('Lyon');


