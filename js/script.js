window.onload = function() {
  Particles.init({
    selector: ".particles",
    color: ['#f5b1c2','#b1dcf5'],
    connectParticles: true,
    maxParticles: 50,
    sizeVariations: 30,
    speed: 0.7,
  });
  };
  
  const locationElement = document.getElementById("location");
  const weatherElement = document.getElementById("weather");
  const temp = document.getElementById("temp");
  const feels = document.getElementById("feels");
  const describe = document.getElementById("describe");
  const H = document.getElementById("H");
  const L = document.getElementById("L");
  
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(showPosition, showError);
  } else {
    locationElement.innerHTML = "Geolocation is not supported by this browser.";
  }
  
  function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
  
    // Call the weather API using the latitude and longitude
    fetchWeather(latitude, longitude);
  
    // Call the reverse geocoding API to get the detailed location
    fetchLocationName(latitude, longitude);
  }
  
  function showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        locationElement.innerHTML = "User denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        locationElement.innerHTML = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        locationElement.innerHTML = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        locationElement.innerHTML = "An unknown error occurred.";
        break;
    }
  }
  
  // //Function to fetch weather data from OpenWeatherMap API
  function fetchWeather(lat, lon) {
    const apiKey = "3017d161afdaa27852d4bfa917b07f9b"; // Replace with your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const weatherDescription = data.weather[0].description;
        const temperature = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const tempMin = Math.round(data.main.temp_min);
        const tempMax = Math.round(data.main.temp_max);
  
        temp.innerHTML = `${temperature}°C`;
        // feels.innerHTML = `${feelsLike}°C`;
        describe.innerHTML = `${weatherDescription}`;
        L.innerHTML = `L: ${tempMin}°C`;
        H.innerHTML = `H: ${tempMax}°C`;
      })
      .catch(error => {
        weatherElement.innerHTML = "Unable to fetch weather data.";
        console.error('Error fetching weather data:', error);
      });
  }
  
  // Function to fetch location name using Google Maps Geocoding API
  function fetchLocationName(lat, lon) {
    const apiKey = "AIzaSyD5L3mCo99uEUheESHANsGV6vuVywjIfv4"; //Google Maps API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.results.length > 0) {
          const addressComponents = data.results[0].address_components;
          const formattedAddress = data.results[0].formatted_address;
          const streetNumberComponent = addressComponents.find(component => component.types.includes('street_number'));
          const routeComponent = addressComponents.find(component => component.types.includes('route'));
          const buildingName = addressComponents.find(component => component.types.includes('premise')) || 
                               addressComponents.find(component => component.types.includes('subpremise'));
          const businessName = addressComponents.find(component => 
                                                      component.types.includes('premise') || 
                                                      component.types.includes('subpremise') ||
                                                      component.types.includes('establishment')
                                                      );
  
  
          const streetNumber = streetNumberComponent ? streetNumberComponent.long_name : '';
          const route = routeComponent ? routeComponent.long_name : '';
          const building = buildingName ? buildingName.long_name : '';
  
          // Format street address
          const streetAddress = building ? `${building}, ${streetNumber} ${route}` : `${streetNumber} ${route}`;
  
          // Extract city, state, and country
          const cityComponent = addressComponents.find(component => component.types.includes('locality'));
          const stateComponent = addressComponents.find(component => component.types.includes('administrative_area_level_1'));
          const countryComponent = addressComponents.find(component => component.types.includes('country'));
  
          const city = cityComponent ? cityComponent.long_name : '';
          const state = stateComponent ? stateComponent.short_name : '';
          const country = countryComponent ? countryComponent.long_name : '';
  
          locationElement.innerHTML = `${streetAddress}`;
  
          console.log("Address: ", businessName);
        } else {
          locationElement.innerHTML = "Unable to determine precise location.";
        }
      })
      .catch(error => {
        locationElement.innerHTML = "Error fetching location details.";
        console.error('Error fetching location name:', error);
      });
  }
  
  
  
  
  
  function initMap() {
    // Create a map centered at a default location
    var map = new google.maps.Map(document.getElementById("googleMap"), {
        zoom: 15, // Adjust zoom level as needed
        center: { lat: -34.397, lng: 150.644 } // Default coordinates
    });
  
    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
  
            // Center the map on the user's location
            map.setCenter(pos);
  
            // Add a marker at the user's location
            new google.maps.Marker({
                position: pos,
                map: map,
                title: 'You are here!'
            });
        }, function() {
            handleLocationError(true, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, map.getCenter());
    }
  }
  
  function handleLocationError(browserHasGeolocation, pos) {
    var message = browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.';
    new google.maps.InfoWindow({
        content: message,
        position: pos
    }).open(map);
  }
  