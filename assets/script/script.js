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
}

/**
 * function to pull the current weather and forecast from api.openweathermap.org
 */
function callWeatherAPI() {
  fetch(weatherAPIURL)
    .then(function (response) {
      console.log(response);
      console.log(response.json);
      return response.json();
    })
    .then(function (data) {
      currentWeatherObj = data;
      console.log(currentWeatherObj);
      init();
    });
}

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

buildURL();
callWeatherAPI();
