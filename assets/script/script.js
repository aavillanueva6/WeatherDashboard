// Defines Global Variables
let currentCity;
if (JSON.parse(localStorage.getItem('searchHistory')) == null) {
  var searchHistoryArray = [];
} else {
  var searchHistoryArray = JSON.parse(localStorage.getItem('searchHistory'));
}

// Defines Global Variables for DOM elements that need handling
const submitBtn = document.querySelector('#submitBtn');
const searchText = document.querySelector('#cityInput');
const currentWeatherDiv = document.querySelector('#currentWeatherDiv');
const forecastDiv = document.querySelector('#forecastDiv');
const searchHistoryDiv = document.querySelector('#searchHistoryDiv');

// defines functions

/**
 * function to create the API call URL using the latitude and longitude of the requested city
 * @param {number} lat The latitude of the requested city
 * @param {number} lon The longitude of the requested city
 */
function buildURL(lat, lon) {
  callWeatherAPI(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=3eff72afc8e025ad160e5e93b1fd826d&units=imperial`
  );
}

/**
 * function to pull the current weather and forecast from api.openweathermap.org
 */
function callWeatherAPI(weatherAPIURL) {
  fetch(weatherAPIURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      localStorage.setItem('weatherObj', JSON.stringify(data));
      init();
      forecastDiv.innerHTML = `<p>Five Day Forecast for ${currentCity}</p>`;
      currentWeatherDiv.textContent = '';
      printCurrentWeather(data.current);
      for (let i = 1; i < 6; i++) {
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
  fetch(geoUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      getCurrentCityString(data);
      buildURL(data[0].lat, data[0].lon);
      saveSearchedCities(data[0].name, currentCity, data[0].lat, data[0].lon);
    })
    .catch(function (error) {
      console.log(error);
      init();
      return;
    });
}

function getCurrentCityString(data) {
  if (data[0].state) {
    currentCity = `${data[0].name}, ${data[0].state}:`;
  } else {
    currentCity = `${data[0].name}, ${data[0].country}:`;
  }
}

/**
 * function to initialize the page.  Runs all necessary functions using default values.
 */
function init() {
  displaySearchHistory();
}

function saveSearchedCities(cityName, cityString, lat, lon) {
  let newCityObject = {
    city: cityName,
    cityState: cityString,
    cityLat: lat,
    cityLon: lon,
  };
  let previouslySearched = false;
  let indexOfCity;
  for (let i = 0; i < searchHistoryArray.length; i++) {
    if (cityName === searchHistoryArray[i].city) {
      previouslySearched = true;
      indexOfCity = i;
      break;
    }
  }

  if (!previouslySearched) {
    searchHistoryArray.unshift(newCityObject);
    if (searchHistoryArray.length > 9) {
      searchHistoryArray.pop();
    }
  } else {
    searchHistoryArray.splice(indexOfCity, 1);
    searchHistoryArray.unshift(newCityObject);
  }
  localStorage.setItem('searchHistory', JSON.stringify(searchHistoryArray));
  displaySearchHistory();
}

function displaySearchHistory() {
  searchHistoryDiv.innerText = '';
  // build out DOM elements for search history
  searchHistoryArray.forEach((element) => {
    let searchHistCard = document.createElement('div');
    searchHistCard.classList.add('card', 'mb-1', 'col-4', 'col-md-12');
    let searchHistCardBody = document.createElement('div');
    searchHistCardBody.classList.add('card-body', 'p-2');
    searchHistCardBody.innerText = element.city;
    searchHistoryDiv.append(searchHistCard);
    searchHistCard.append(searchHistCardBody);
  });
}

function printCurrentWeather(weatherObj) {
  // build out DOM elements for current weather
  let todayCard = document.createElement('div');
  todayCard.classList.add(
    'card',
    'bg-secondary',
    'text-dark',
    'mb-3',
    'me-1',
    'p-3'
  );
  let cardHeader = document.createElement('h2');
  cardHeader.classList.add();
  let iconURL = `https://openweathermap.org/img/wn/${weatherObj.weather[0].icon}@2x.png`;
  let dateString = timeConverter(weatherObj.dt);
  cardHeader.innerHTML = `${currentCity} ${dateString} <img src=${iconURL} height='32px'>`;
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
  // build out DOM elements for forecast
  let forecastCard = document.createElement('div');
  forecastCard.classList.add(
    'card',
    'bg-dark',
    'text-white',
    'mb-3',
    'me-1',
    'p-2',
    'rounded'
  );
  let cardBody = document.createElement('div');
  cardBody.classList.add('card-body', 'p-0');
  let cardTitle = document.createElement('div');
  cardTitle.classList.add('card-title');
  let iconImg = document.createElement('img');
  let tempP = document.createElement('p');
  let windP = document.createElement('p');
  let humidityP = document.createElement('p');

  // call time converter to get date string
  let dateString = timeConverter(weatherObj.dt);

  //add text/images to DOM elements in card
  cardTitle.innerText = dateString;
  iconImg.setAttribute(
    'src',
    `https://openweathermap.org/img/wn/${weatherObj.weather[0].icon}@2x.png`
  );
  iconImg.setAttribute('height', '32px');
  tempP.innerText = `Temp:      ${weatherObj.temp.day} °F`;
  windP.innerText = `Wind:      ${weatherObj.wind_speed} MPH`;
  humidityP.innerText = `Humidity:  ${weatherObj.humidity} %`;

  //append items to DOM
  forecastDiv.append(forecastCard);
  forecastCard.append(cardBody);
  cardBody.append(cardTitle, iconImg, tempP, windP, humidityP);
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
  return `${date}/${month}/${year}`;
}

// Defines event listeners
submitBtn.addEventListener('click', function (event) {
  event.preventDefault();
  let formInput = searchText.value;
  searchText.value = '';
  getLatLon(formInput);
});

searchHistoryDiv.addEventListener('click', function (event) {
  getLatLon(event.target.innerText);
});

init();
