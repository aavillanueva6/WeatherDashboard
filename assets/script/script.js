// Defines Global Variables
let weatherAPIURL;
let currentWeatherObj;
let currentCity;

// Defines Global Variables for DOM elements that need handling
const submitBtn = document.querySelector('#submitBtn');
const searchText = document.querySelector('#cityInput');
const currentWeatherDiv = document.querySelector('#currentWeatherDiv');
const forecastDiv = document.querySelector('#forecastDiv');

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
      let dateString = timeConverter(data.current.dt);
      console.log(dateString);
      printCurrentWeather(data.current);
      for (let i = 0; i < 5; i++) {
        printForecast(data.daily[i]);
      }
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
      currentCity = `${data[0].name}, ${data[0].state}:`;
      let cityNameSpans = document.querySelectorAll('.cityName');
      cityNameSpans.forEach((element) => {
        element.textContent = currentCity;
      });
      buildURL(data[0].lat, data[0].lon);
    })
    .catch(function (error) {
      console.log(error);
      init();
      return;
    });
}

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
  // displayCurrentIcon();
  timeConverter(1648584000);
}

function printCurrentWeather(weatherObj) {
  console.log(weatherObj);
  // build out DOM elements for current weather
  let todayCard = document.createElement('div');
  todayCard.classList.add('card', 'bg-light', 'text-dark', 'mb-3', 'p-3');
  let cardHeader = document.createElement('h3');
  cardHeader.classList.add();
  let iconURL = `https://openweathermap.org/img/wn/${weatherObj.weather[0].icon}@2x.png`;
  let dateString = timeConverter(weatherObj.dt);
  cardHeader.innerHTML = `${currentCity} ${dateString} <img src=${iconURL}>`;
  let tempP = document.createElement('p');
  let windP = document.createElement('p');
  let humidityP = document.createElement('p');
  let UVIP = document.createElement('p');
  tempP.innerText = `Temp:      ${weatherObj.temp} °F`;
  windP.innerText = `Wind:      ${weatherObj.wind_speed} MPH`;
  humidityP.innerText = `Humidity:  ${weatherObj.humidity} %`;
  UVIP.innerHTML = `UV Index:  <span id='UVIndex'>${weatherObj.uvi}</span>`;

  // Append DOM elements
  currentWeatherDiv.append(todayCard);
  todayCard.append(cardHeader, tempP, windP, humidityP, UVIP);

  // set color for UV Index
  let UVSpan = document.querySelector('#UVIndex');
  if (weatherObj.uvi < 2) {
    UVSpan.classList.add('text-white', 'bg-success');
  } else if (weatherObj.uvi < 8) {
    UVSpan.classList.add('text-dark', 'bg-warning');
  } else {
    UVSpan.classList.add('text-white', 'bg-danger');
  }
}

function printForecast(weatherObj) {
  console.log(weatherObj);
  // build out DOM elements for forecast
  let forecastContainer = document.createElement('div');
  forecastContainer.classList.add(
    'card',
    'bg-light',
    'text-dark',
    'mb-3',
    'p-3'
  );
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
  console.log(`${date}/${month}/${year}`);
  return `${date}/${month}/${year}`;
}

// Defines event listeners
submitBtn.addEventListener('click', function (event) {
  event.preventDefault();
  forecastDiv.textContent = '';
  currentWeatherDiv.textContent = '';
  let formInput = searchText.value;
  getLatLon(formInput);
});

// buildURL();
// callWeatherAPI();
