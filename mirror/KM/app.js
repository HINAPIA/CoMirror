const receivedData = location.href.split('?')[1];
let mirrorDB = require('./mirror_db');
mirrorDB.userId = receivedData;


// 날씨 모듈 불러오기
require('./weather_module/weather.js');

// memo 제작
require('./memo_module/create_memo');

// memo ui 설정
require('./memo_module/sticker');

