
class Weather {
    constructor() {
        this.key = 'c4210b6e0e1aba39c98584f4f2a64f0d';
        this.city = 'seoul';
        this.url = 'http://api.openweathermap.org/data/2.5/weather?q='+city+'&appid='+key+'&units=metric';
        this.icon;
    }
    get Key(){
        return key;
    }
    callback(err, data) {
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
    
            var currentIcon = document.getElementById("weatherIcon");
            icon = data.weather[0].icon;
            var iconImg = `http://openweathermap.org/img/wn/${icon}@2x.png`;
    
            var currentDiv = document.getElementById("weather");
            
            currentDiv.innerText = `${temperature} °C / ${humidity}% / ${data.weather[0].description}`;
            currentIcon.setAttribute('src', iconImg);
    
        }
    }

    getJSON() {
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
    }

    getWeather() {
        url = 'http://api.openweathermap.org/data/2.5/weather?q='+city+'&appid='+key+'&units=metric';
    }
}

module.exports = new Weather();