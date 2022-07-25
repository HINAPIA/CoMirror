
const mqtt = require('mqtt');
const mqtt_client = mqtt.connect("mqtt://test.mosquitto.org")

mqtt_client.subscribe('memo');

mqtt_client.on('message',function(topic,message){
    console.log(`토픽:${topic.toString()}, 메세지:${message.toString()}`);
    document.getElementById("memo_subscribe").innerHTML = message;
});