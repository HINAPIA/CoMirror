
const mqtt = require('mqtt')
//const client = mqtt.connect('mqtt://test.mosquitto.org')

const options = {
  host: '127.0.0.1',
  port: 1883
};

client = mqtt.connect(options);


client.subscribe('create_memo');
client.subscribe('memo_content');

client.on('message', function(topic, message){
    if(topic.toString() == 'create_memo'){
        document.getElementById('stickerImg').src = 'memo_module/img/call.png';
        document.getElementById("memo").innerHTML = '남길 메모를 말해주세요';
    }
    else if(topic.toString() == 'memo_content'){
        document.getElementById('stickerImg').src = 'memo_module/img/sticker.png';
        document.getElementById("memo").innerHTML = `메모 내용: \"${message.toString()}\"`;
    }
});

