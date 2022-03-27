// Defines Global Variables
let weatherAPIURL;
let currentWeatherObj;

// defines functions

/**
 * function to create the API call URL using the latitude and longitude of the requested city
 * @param {number} lat The latitude of the requested city
 * @param {number} lon The longitude of the requested city
 * default is Seattle (47.61, -122.33)
 */
function buildURL(lat = 47.61, lon = -122.33) {
  weatherAPIURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=3eff72afc8e025ad160e5e93b1fd826d&units=imperial`;
  callWeatherAPI();
}

/**
 * function to pull the current weather and forecast from api.openweathermap.org
 */
function callWeatherAPI() {
  fetch(weatherAPIURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      currentWeatherObj = data;
      console.log(currentWeatherObj);
      init();
    });
}

/**
 * function to pull the latitude and longitude of the user input city.
 * uses openweathermap geocoding API.  Defaults to Seattle
 */
function getLatLon(city, state, country) {
  let searchString = '';
  if (!city) {
    console.log('no city provided'); // add some message to user at this point, to handle the error
    return;
  }
  if (!state) {
    state = '';
  }
  if (!country) {
    country = '';
  }
  searchString = `${city},${state},${country}`;

  let geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${searchString}&limit=1&appid=3eff72afc8e025ad160e5e93b1fd826d`;
  console.log(geoUrl);
  fetch(geoUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      console.log(data[0].lat);
      buildURL(data[0].lat, data[0].lon);
    });
}
getLatLon('portland');

function displayCurrentIcon() {
  let currentIconValue = currentWeatherObj.current.weather[0].icon;
  console.log(currentIconValue);
  let iconURL = `https://openweathermap.org/img/wn/${currentIconValue}@2x.png`;
  let iconEl = document.createElement('img');
  iconEl.setAttribute('src', iconURL);
  document.querySelector('#weatherIcon').appendChild(iconEl);
}

/**
 * function to initialize the page.  Runs all necessary functions using default values.
 */
function init() {
  displayCurrentIcon();
}

// buildURL();
// callWeatherAPI();
