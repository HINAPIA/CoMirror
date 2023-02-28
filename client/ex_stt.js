const mqtt = require('mqtt')
const moment = require('moment')
const options = {  //broker 연동 위한 옵션(브로커 IP 및 포트번호)
  host: '127.0.0.1',
  port: 1883
};
mqttClient = mqtt.connect(options);

mqttClient.publish(`text`, "집에 가고 싶어 언제쯤 갈 수 있을까?")
mqttClient.publish(`text`, "내일 오후 10시에 우리집으로 와")
mqttClient.publish(`text`, "내일 아이디어 회의 어디서 몇 시에 할까?")
mqttClient.publish(`text`, "오늘 점심값 삼만원 나왔어 만오천원 보내줘")
mqttClient.publish(`text`, "우리의 다음 목표 C&C 페스티벌 1등")
mqttClient.publish(`text`, "파이썬 보조 언제부터라고?")
mqttClient.publish(`text`, "시험 망쳤어 이번 방학에는 공부해야겠다 ")
mqttClient.publish(`text`, "그래서 학원 등록했어 안했어?")
mqttClient.publish(`text`, "우리 언제 놀러갈래?")
mqttClient.publish(`text`, "팥고당은 딸기라떼가 맛있다")
