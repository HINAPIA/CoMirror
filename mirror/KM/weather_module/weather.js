const key = 'c4210b6e0e1aba39c98584f4f2a64f0d'
let city = 'seoul'

let weatherIcon ={
    '01' : 'wi wi-day-sunny',
    '02' : 'wi wi-day-cloudy',
    '03' : 'wi wi-cloud',
    '04' : 'wi wi-cloudy',
    '09' : 'wi wi-showers',
    '10' : 'wi wi-day-rain',
    '11' : 'wi wi-thunderstorm',
    '13' : 'wi wi-snow',
    '50' : 'wi-fog'
};

const callback = function(err, data) {
    if(err !== null) {
    alert('예상치 못한 오류 발생.' + err);
    } else {
        let temperature = data.main.temp;
        let feels_temp = data.main.feels_temp;
        let humidity = data.main.humidity;
        let temp_min = data.main.temp_min;
        let temp_max = data.main.temp_max;

        let wind_speed = data.wind.wind_speed;
        let clouds = data.clouds.all;

        var iconValue = (data.weather[0].icon).substr(0,2);
        let icon = document.createElement('i');
        icon.className = weatherIcon[iconValue];

        document.getElementById("CurrIcon").append(icon);

        var currentDiv = document.getElementById("weather");
        document.getElementById("temp").innerText = `${Math.round(temperature) } `;
        currentDiv.innerText = `${data.weather[0].description}`;
    }
}

const getJSON = function(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        const status = xhr.status;
        if(status === 200) {
        callback(null, xhr.response);
        } else {
        callback(status, xhr.response);
        }
    };
    xhr.send();
};

// //좌표를 물어보는 함수 
// function askForCoords() {
//     navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
//     console.log('ok');
// }

// //좌표를 얻는데 성공했을 때 쓰이는 함수 
// function handleSuccess(position) {
//     const latitude = position.coords.latitude;
//     const longitude = position.coords.longitude;
//     const coordsObj = {
//         latitude,
//         longitude
//     };
//     getWeather(latitude, longitude); //얻은 좌표값을 바탕으로 날씨정보를 불러온다.
//     console.log(latitude+": "+longitude);
// }

// //좌표를 얻는데 실패했을 때 쓰이는 함수 
// function handleError() {
//     console.log("can't not access to location");
// }

// askForCoords();

const getWeather = function() {
    console.log('getWeather');
    getJSON('http://api.openweathermap.org/data/2.5/weather?q='+city+'&appid='+key+'&units=metric');
}

module.exports = getWeather();