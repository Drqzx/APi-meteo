// Variables globales
let map;
const API_KEY = 'a950f5d15e54b182c392c864357ceae9';

// Fonction pour initialiser la carte
function initMap() {
    try {
        map = L.map('map').setView([48.8566, 2.3522], 5);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        console.log("Carte initialisée avec succès");
    } catch (error) {
        console.error("Erreur lors de l'initialisation de la carte:", error);
    }
}

// Fonction pour rechercher la météo
function getWeather(city) {
    console.log(`Recherche de la météo pour: ${city}`);
    
    // Afficher l'état de chargement
    updateWeatherUI('Chargement...', '--°C', '--', '--%', '-- m/s', '--°C', '-- hPa');
    
    // Construire l'URL de l'API avec encodage URI pour gérer les caractères spéciaux
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&lang=fr&units=metric`;
    console.log(`URL de l'API: ${apiUrl}`);
    
    fetch(apiUrl)
        .then(response => {
            console.log(`Statut de la réponse: ${response.status}`);
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: Ville introuvable`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Données météo reçues:', data);
            
            // Extraire les données
            const cityName = data.name;
            const country = data.sys.country;
            const temp = Math.round(data.main.temp);
            const feelsLike = Math.round(data.main.feels_like);
            const description = data.weather[0].description;
            const icon = data.weather[0].icon;
            const humidity = data.main.humidity;
            const wind = data.wind.speed;
            const pressure = data.main.pressure;
            const lat = data.coord.lat;
            const lon = data.coord.lon;
            
            // Mettre à jour l'interface
            updateWeatherUI(`${cityName}, ${country}`, `${temp}°C`, description, `${humidity}%`, `${wind} m/s`, `${feelsLike}°C`, `${pressure} hPa`, icon);
            
            // Mise à jour de la date et l'heure
            updateDateTime();
            
            // Mise à jour de la carte
            updateMap(lat, lon, cityName);
            
            // Enregistrer la recherche dans la base de données
            saveSearch(city);
        })
        .catch(error => {
            console.error('Erreur lors de la recherche météo:', error);
            updateWeatherUI('Ville introuvable', '--°C', '--', '--%', '-- m/s', '--°C', '-- hPa');
            alert('Erreur: Ville introuvable. Veuillez vérifier l\'orthographe et réessayer.');
        });
}

// Fonction pour mettre à jour l'interface utilisateur de la météo
function updateWeatherUI(cityName, temp, description, humidity, wind, feelsLike, pressure, icon = '') {
    document.getElementById('city-name').textContent = cityName;
    document.getElementById('temperature').textContent = temp;
    document.getElementById('feels-like').textContent = feelsLike;
    document.getElementById('description').textContent = description;
    document.getElementById('humidity').textContent = humidity;
    document.getElementById('wind').textContent = wind;
    document.getElementById('pressure').textContent = pressure;
    
    if (icon) {
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;
        document.getElementById('weather-icon').src = iconUrl;
    }
}

// Fonction pour mettre à jour la carte
function updateMap(lat, lon, cityName) {
    console.log(`Mise à jour de la carte: Lat ${lat}, Lon ${lon}`);
    
    // Mise à jour des coordonnées GPS
    document.getElementById('coordinates').textContent = `Latitude: ${lat.toFixed(4)}, Longitude: ${lon.toFixed(4)}`;
    
    try {
        // Centrer la carte
        map.setView([lat, lon], 12);
        
        // Supprimer les anciens marqueurs
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
        
        // Ajouter un nouveau marqueur
        L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${cityName}</b><br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`)
            .openPopup();
            
        console.log("Carte mise à jour avec succès");
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la carte:", error);
    }
}

// Fonction pour mettre à jour la date et l'heure
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const formattedDate = now.toLocaleDateString('fr-FR', options);
    document.getElementById('date-time').textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

// Fonction pour enregistrer la recherche
function saveSearch(city) {
    fetch('save_search.php', {
        method: 'POST',
        body: new URLSearchParams({
            'city': city
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => response.text())
    .then(data => {
        console.log('Recherche sauvegardée:', data);  // Afficher la réponse du serveur
    })
    .catch(error => {
        console.error('Erreur lors de la sauvegarde de la recherche:', error);
    });
}

// Fonction pour afficher le graphique
function displayChart(data) {
    const ctx = document.getElementById('search-chart').getContext('2d');

    const labels = data.map(item => item.city);
    const counts = data.map(item => item.count);

    // Créer le graphique avec Chart.js
    const searchChart = new Chart(ctx, {
        type: 'bar',  // Type de graphique (barres)
        data: {
            labels: labels,  // Noms des villes
            datasets: [{
                label: 'Nombre de recherches par ville',
                data: counts,  // Nombre de recherches par ville
                backgroundColor: '#4caf50',  // Couleur des barres
                borderColor: '#388e3c',  // Couleur de la bordure des barres
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Fonction pour récupérer les statistiques des recherches
function getStats() {
    fetch('get_stats.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Erreur lors de la récupération des statistiques:', data.error);
            } else {
                console.log('Statistiques des recherches:', data);
                displayChart(data);  // Afficher le graphique
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des statistiques:', error);
        });
}

// Attendre que le DOM soit entièrement chargé
window.onload = function() {
    console.log("Page chargée - Initialisation...");
    
    // Initialiser la carte
    initMap();
    
    // Mettre à jour la date et l'heure
    updateDateTime();
    
    // Configurer l'écouteur d'événement pour le bouton de recherche
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            console.log("Bouton de recherche cliqué");
            const cityInput = document.getElementById('city-input');
            const city = cityInput ? cityInput.value.trim() : '';
            
            if (city) {
                getWeather(city);
            } else {
                alert('Veuillez entrer une ville.');
            }
        });
        console.log("Écouteur de clic configuré");
    } else {
        console.error("Bouton de recherche non trouvé dans le DOM");
    }
    
    // Configurer l'écouteur d'événement pour la touche Entrée
    const cityInput = document.getElementById('city-input');
    if (cityInput) {
        cityInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                console.log("Touche Entrée pressée");
                const city = this.value.trim();
                
                if (city) {
                    getWeather(city);
                } else {
                    alert('Veuillez entrer une ville.');
                }
            }
        });
        console.log("Écouteur de touche configuré");
    } else {
        console.error("Champ de saisie non trouvé dans le DOM");
    }
    
    // Charger la météo pour Montpellier par défaut
    getWeather('Montpellier');
    
    // Récupérer et afficher les statistiques des recherches
    getStats();
};