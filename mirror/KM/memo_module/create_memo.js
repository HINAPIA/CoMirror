const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://test.mosquitto.org')

client.subscribe('create_memo');
client.subscribe('memo_content');

client.on('message', function(topic, message){
    if(topic.toString() == 'create_memo'){
        document.getElementById("memo").innerHTML = '남길 메모를 말해주세요';
    }
    else if(topic.toString() == 'memo_content'){
    document.getElementById("memo").innerHTML = `메모 내용: \"${message.toString()}\"`;
    }
});

