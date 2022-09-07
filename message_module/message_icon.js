
const mqtt = require('mqtt')

const bar_message_button = document.querySelector("#bar_message_button");
const message_memo_container = document.querySelector("#message_memo_container");
const write_button = document.querySelector("#write_button");
const back_button = document.querySelector("#back_button");
const text_content = document.querySelector("#text_content");
const image_content = document.querySelector("#image_content");
const record_content = document.querySelector("#record_content");

const option_radio = document.querySelector(".option_radio");
const text = document.querySelector("#text");
const image = document.querySelector("#image");
const record = document.querySelector("#record");

const shutter_button = document.querySelector("#shutter_button");
const send_button = document.querySelector('.send_button');

const send_modal = document.querySelector('#send-modal');


const { write } = require("fs");
const client = require("./message_module/message_mqtt");


/* Section. stt 위한 MQTT 사용 */

/* mqtt 브로커 연결 및 topic subscribe */
const options = { // 브로커 정보(ip, port)
    host: '127.0.0.1',
    port: 1883
}

const mqttClient = mqtt.connect(options) // mqtt broker 연결
mqttClient.subscribe('message_request')

mqttClient.on('message', function (topic, message) { // 메시지 받았을 때 callback
    console.log("메시지 받았을 때 - 연락처")
    if (topic.toString() == 'message_request') { // 메시지 호출
        bar_message_button.click();
    }
})


// message display ON/OFF
bar_message_button.addEventListener('click', ()=> {
    console.log('bar_message_button click!');
    if(message_memo_container.style.display == "none"){
        message_memo_container.style.display = "block";
        //init
        write_button.style.display = "block";
        back_button.style.display = "none";
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display="none";
        // camera on
        client.publish('camera/on',"start");
    }
    else{
        message_memo_container.style.display = "none";
    }
})

write_button.addEventListener('click', showWrite);
back_button.addEventListener('click', showStore);
send_button.addEventListener('click',  () => {
    console.log("showSendModal");
    send_modal.style.visibility = 'visible';
});

shutter_button.addEventListener('click', () => {
    client.publish('capture/camera',"start");
});


function showSendModal(){
    console.log("showSendModal");
    send_modal.style.visibility = "visible";
    
}

function showTextContent(){
    text_content.style.display = "block";
    image_content.style.display = "none";
    record_content.style.display="none";
}

function showImageContent(){
    text_content.style.display = "none";
    image_content.style.display = "block";
    record_content.style.display="none";
}

function showRecordContent(){
    text_content.style.display = "none";
    image_content.style.display = "none";
    record_content.style.display = "block";
}


// Write Mode
function showWrite(){
    write_button.style.display = "none";
    back_button.style.display = "block";

    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".option_radio");
    // var radio = document.getElementsByName("option");
    var sel_type = null;
    for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked == true) sel_type = radio[i].value;
    }

    if (sel_type == "text") {
        console.log("write mode : text");
        showTextContent();
    }
    else if (sel_type == "image") {
        console.log("write mode : image");
        showImageContent();
    }
    else { // sel_type == "record"
        console.log("write mode : record");
        showRecordContent();
    }
}

// Store Mode
function showStore(){
    write_button.style.display = "block";
    back_button.style.display = "none";

    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".option_radio");
    var sel_type = null;
    for(var i=0;i<radio.length;i++){
        if(radio[i].checked == true) sel_type = radio[i].value;
    }

    if(sel_type == "text"){
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display="none";
    }
    else if(sel_type == "image"){
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display="none";
    }
    else { // sel_type == "record"
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display="none";
    }
}

// radio button
text.addEventListener('change', () => {
    if(write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
image.addEventListener('change', () => {
    if(write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
record.addEventListener('change', () => {
    if(write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})