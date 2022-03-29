// Defines Global Variables
let weatherAPIURL;
let currentWeatherObj;

// Defines Global Variables for DOM elements that need handling
const submitBtn = document.querySelector('#submitBtn');
const searchText = document.querySelector('#cityInput');

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
      localStorage.setItem('weatherObj', JSON.stringify(data));
      console.log(currentWeatherObj);
      init();
      timeConverter(data.current.dt);
    })
    .catch(function (error) {
      console.log(error);
      return;
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
    })
    .catch(function (error) {
      console.log(error);
      init();
      return;
    });
}
// getLatLon('seattle', 'washington', 'united');

function displayCurrentIcon() {
  // TODO the line between these comments needs to be deleted later.  Added for testing with saved weather data in LS.
  let currentWeatherObj = JSON.parse(localStorage.getItem('weatherObj'));
  console.log(currentWeatherObj);
  console.log('unix time: ', currentWeatherObj.current.dt);
  console.log('temperature: ', currentWeatherObj.current.temp);
  console.log('wind speed: ', currentWeatherObj.current.wind_speed);
  console.log('humidity: ', currentWeatherObj.current.humidity);
  console.log('UV Index: ', currentWeatherObj.current.uvi);
  // TODO the line between these comments needs to be deleted later.  Added for testing with saved weather data in LS.

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
  timeConverter(1648584000);
}

/**
 *function takes timestamp in Unix time and returns formatted day, month, year for displaying to user.
 */
function timeConverter(unixTime) {
  let jsTime = new Date(unixTime * 1000);
  let months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  let year = jsTime.getFullYear();
  let month = months[jsTime.getMonth()];
  let date = jsTime.getDate();
  console.log(year);
  console.log(month);
  console.log(date);
}

// Defines event listeners
submitBtn.addEventListener('click', function (event) {
  event.preventDefault();
  let formInput = searchText.value;
  console.log(formInput);
  // formInput = formInput.split(',');
  formInput = formInput.split(' ');
  formInput.forEach((element) => {
    let elementArray = element.split;
  });
  console.log(formInput[0]);
  console.log(formInput[1]);
  console.log(formInput[2]);
  console.log(formInput);
  getLatLon(formInput[0], formInput[1], formInput[2]);
});

// buildURL();
// callWeatherAPI();
