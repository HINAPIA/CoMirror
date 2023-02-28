

const moment = require('moment')
const options = {  //broker 연동 위한 옵션(브로커 IP 및 포트번호)
  host: '127.0.0.1',
  port: 1883
};
mqttClient = mqtt.connect(options);

let loop = 100; // 1억
let sum = 0;
let startTime;
let endTime;


console.log("stt start");

let count = 0;
// 사진
const performEvalue = setInterval(function () { // 5초 후 실행
  if(count>loop){
    clearInterval(performEvalue);
  }
  
  var time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  var buf = {
      sender:"1001",
      receiver: "4004",
      content: "오늘 저녁 뭐먹어?",
      type: 'text',
      send_time: time
  }

  startTime = new Date().getTime();
  mqttClient.publish(`text`, JSON.stringify(buf))
  console.log(count+' : publish');
  count++;
}, 1000)

mqttClient.on('connect', function () {

    console.log("서버 mqtt와 연결");
    //real time message 받는 토픽
    mqttClient.subscribe(`text`);
})

mqttClient.on('message', async (topic, message, packet) => {
    //로그인시 서버로부터 받은 메시지 저장 
    if (topic == `text`) {
      endTime = new Date().getTime();
      console.log(endTime - startTime);
    }

})
