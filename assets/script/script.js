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
 * function to call the weather API for the user requested city
 * @param {string} weatherAPIURL formatted string containing required parameters for the fetch call
 */
function callWeatherAPI(weatherAPIURL) {
  fetch(weatherAPIURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      forecastDiv.innerHTML = `<p>Five Day Forecast for ${currentCity}</p>`; // clears the results from the previous city search
      currentWeatherDiv.textContent = ''; // clears the results from the previous city search
      printCurrentWeather(data.current); // runs the printCurrentWeather function for the current weather from the data object
      for (let i = 1; i < 6; i++) {
        printForecast(data.daily[i]); // runs the printForecast function for the five following days after the current day
      }
    })
    .catch(function (error) {
      console.log(error);
      return;
    });
}

/**
 * function to pull the latitude and longitude of the user input city.
 * @param {string} city city name input from user form
 * calls buildURL and saveSearchedCities functions
 */
function getLatLon(city) {
  let searchString = '';
  // exits the function if the user did not provide an input in the form
  if (!city) {
    console.log('no city provided'); // add some message to user at this point, to handle the error
    return;
  }
  searchString = `${city},,`;

  let geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${searchString}&limit=1&appid=3eff72afc8e025ad160e5e93b1fd826d`;
  fetch(geoUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // if statement to build string that will be used to display the searched city and state or city and country to the user
      if (data[0].state) {
        currentCity = `${data[0].name}, ${data[0].state}:`;
      } else {
        currentCity = `${data[0].name}, ${data[0].country}:`;
      }
      buildURL(data[0].lat, data[0].lon);
      saveSearchedCities(data[0].name, currentCity, data[0].lat, data[0].lon);
    })
    .catch(function (error) {
      console.log(error);
      init();
      return;
    });
}

/**
 * function to initialize the page.  Runs all necessary functions using default values.
 */
function init() {
  displaySearchHistory();
}

/**
 * function to save the recent search history to LS. After saving to LS, it calls the displaySearchHistory function
 * @param {string} cityName   saves the city name that the user searched
 * @param {string} cityString   saves the cityString that is displayed to the user
 * @param {string} lat  saves the city's latitude
 * @param {string} lon  saves the city's longitude
 * cityString, lat, and lon are currently not used.  Code could be optimized to use those instead of re-calling the getLatLon function on a saved city search.  This functionality is not in this release.
 */
function saveSearchedCities(cityName, cityString, lat, lon) {
  let newCityObject = {
    city: cityName,
    cityState: cityString,
    cityLat: lat,
    cityLon: lon,
  };
  let previouslySearched = false;
  let indexOfCity;
  // checks to see if the new city has already been added to the search history
  for (let i = 0; i < searchHistoryArray.length; i++) {
    if (cityName === searchHistoryArray[i].city) {
      previouslySearched = true;
      indexOfCity = i;
      break;
    }
  }
  // adds newest searched city to front of array, and removes last element if more than 9 cities remain in the history array.
  // if the city was already searched, it deletes the city from the array, and adds it back to the beginning of the array, to keep most recent search at the top.
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

/**
 * function to add one card for every city in the searchHistoryArray
 */
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

/**
 * function to display the current weather pulled from the weather API.
 * @param {object} weatherObj passed in from the weather API GET request
 */
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

/**
 * function to print one card for one day of the forecast.  Is called using a for loop to run once for each weatherObj for the next five day forecast.
 * @param {object} weatherObj
 */
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
 * function to convert the unix timestamp and convert it to a format to display to the user
 * @param {number} unixTime
 * @returns formatted date string
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

// adds event listener for the user input form.  Clears the user input after getting the data out of the form, then calls the getLatLon function
submitBtn.addEventListener('click', function (event) {
  event.preventDefault();
  let formInput = searchText.value;
  searchText.value = '';
  getLatLon(formInput);
});

// adds event listener to the search history container.  Calls the getLatLon function if the inner text of the target is a city name
searchHistoryDiv.addEventListener('click', function (event) {
  getLatLon(event.target.innerText);
});

init();
