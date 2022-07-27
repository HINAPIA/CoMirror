var async = require('async');

const dbAccess = require('../mirror_db.js')

const mqtt = require('mqtt')

const options = {
    host: '127.0.0.1',
    port: 1883
};

const client = mqtt.connect(options);

client.subscribe('create_memo');
client.subscribe('memo_content');

client.on('message', function (topic, message) {
    if (topic.toString() == 'create_memo') {
        document.getElementById('stickerImg').src = 'memo_module/img/call.png';
        document.getElementById("memo").innerHTML = '남길 메모를 말해주세요';
    }
    else if (topic.toString() == 'memo_content') {
        document.getElementById('stickerImg').src = 'memo_module/img/sticker.png';
        document.getElementById("memo").innerHTML = `메모 내용: \"${message.toString()}\"`;

        const user_id = 1;
        const contents = message.toString();
        const store = 0;
        const delete_time = 0;
        dbAccess.addMemo(user_id, contents, store, delete_time);

    }
});

// function f1(){
//     const user_id = 1;
//     const contents ='dddddd';
//     const store = 0;
//     const delete_time = 0;
//     dbAccess.addMemo(user_id, contents, store, delete_time);
// }

function f1(){
    console.log('select_re: ' + dbAccess.selectColumns('seq', 'user', 'user_id=1'));
}

f1();
var i = 0;
var stt_stop = function () {
    console.log('call stt_stop');
    client.publish('stt_stop', "stop");
}

module.exports = function () {
    stt_stop();
};