const dbAccess = require('../mirror_db.js')

const mqtt = require('mqtt')

document.getElementById("apply").addEventListener("click",setIsAddableDB);
document.getElementById("cancle").addEventListener("click",setIsAddableDB);

const options = {
    host: '127.0.0.1',
    port: 1883
};

const client = mqtt.connect(options);

let isAddableDB = true;

client.subscribe('create_memo');
client.subscribe('memo_content');

client.on('message', function (topic, message) {
    if (topic.toString() == 'create_memo') {
        document.getElementById('callImg').style.visibility = "visible";
        document.getElementById("memoDiv").style.visibility = "hidden";
        document.getElementById("memo").innerHTML = '남길 메모를 말해주세요';
    }
    else if (topic.toString() == 'memo_content') {
        if (isAddableDB == true){ 
        document.getElementById('callImg').style.visibility = "hidden";
        document.getElementById('memoDiv').style.visibility = "visible";
        document.getElementById("memo").innerHTML = `메모 내용: \"${message.toString()}\"`;

        const user_id = 1;
        const contents = message.toString();
        const store = 1;
        dbAccess.addMemo(user_id, contents, store);
        isAddableDB = false;
        }
    }
});


function setIsAddableDB(){
    isAddableDB = true;
    console.log("song//set isAddableDB: " + isAddableDB);
    document.getElementById("memoDiv").style.visibility = "hidden";
    document.getElementById("memo").innerHTML = "memo";
}


var stt_stop = function () {
    console.log('call stt_stop');
    client.publish('stt_stop', "stop");
}

module.exports = function () {
    stt_stop();
};