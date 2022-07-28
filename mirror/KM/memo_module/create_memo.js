const dbAccess = require('../mirror_db.js')

const mqtt = require('mqtt')

document.getElementById("apply").addEventListener("click",setIsAddableDB);
document.getElementById("cancle").addEventListener("click",setIsAddableDB);

const options = {
    host: '127.0.0.1',
    port: 1883
};

let isAddableDB = true;

const client = mqtt.connect(options);

client.subscribe('create_memo');
client.subscribe('memo_content');

client.on('message', function (topic, message) {
    if (topic.toString() == 'create_memo') {
        document.getElementById('stickerImg').src = 'memo_module/img/call.png';
        document.getElementById("memo").innerHTML = '남길 메모를 말해주세요';
        console.log("song//topic:create_memo algorithem");

    }
    else if (topic.toString() == 'memo_content') {
        console.log("song//here is memo_content algorithem");
        if (isAddableDB == true){ 
            document.getElementById("memoDiv").style.visibility = "visible";
            document.getElementById('stickerImg').src = 'memo_module/img/sticker.png';
            document.getElementById("memo").innerHTML = `메모 내용: \"${message.toString()}\"`;

            const user_id = 1;
            const contents = message.toString();
            const store = 0;
            const delete_time = 0;
            dbAccess.addMemo(user_id, contents, store, delete_time);
            isAddableDB = false;
            console.log("song//isAddableDB value: " + isAddableDB);
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