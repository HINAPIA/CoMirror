const mirror_db = require('./mirror_db')

const bar_memo_button = document.querySelector("#bar_memo_button");
const memo_container = document.querySelector("#memo_container");
const memo_write_button = document.querySelector("#memo_write_button");
const memo_back_button = document.querySelector("#memo_back_button");
const memo_text_content = document.querySelector("#memo_text_content");
const memo_image_content = document.querySelector("#memo_image_content");
const memo_record_content = document.querySelector("#memo_record_content");
const memo_textArea = document.getElementById('memo_textArea');
let memo_player = document.getElementById("memo_player");

console.log("memo_icon 여기 들어옴");

memo_textArea.addEventListener('click', function (e) { showKeyboard(e) });

const client = require('./message_module/message_mqtt');
const memo_text = document.querySelector("#memo_text");
const memo_image = document.querySelector("#memo_image");
const memo_record = document.querySelector("#memo_record");
const shutter_button = document.querySelector("#memo_shutter_button");
const save_button = document.querySelectorAll('.save_button');

const sttRefusalContainer = document.getElementById('stt-refusal-container')
const sttAlert = document.getElementById('stt-alert')

// const axios = require('axios');
const { write } = require("fs");
const CMUsers = require("./CMUserInfo");

let record_obj = require('./memo_module/memo_record');
const { Store } = require('mqtt');

// const mqtt = require('mqtt');
// const dbAccess = require("../mirror_db");

// stt 실행 =======================================================================================
let customOption = false
let friendName
let setCMuser
let setCMFriend
let customFriend = null

const memo_storage = require('./memo_module/memo_storage');
/* mqtt 브로커 연결 및 topic subscribe */
const options = { // 브로커 정보(ip, port)
    host: '127.0.0.1',
    port: 1883
}

// message display ON/OFF
bar_memo_button.addEventListener('click', () => {
    console.log('bar_memo_button click!');

    document.querySelector("#memo_textArea").value = "";
    if (memo_container.style.display == "none") {
        memo_container.style.display = "block";
        console.log("container의 style이 blovck으로 변경됨")
        // text.style.display = "none";
        // image.style.display = "none";
        // record.style.display = "none";
        // document.getElementById('radio_container').style.display = "none";
        //init
        memo_write_button.style.display = "block";
        memo_back_button.style.display = "none";
        memo_text_content.style.display = "none";
        memo_image_content.style.display = "none";
        memo_record_content.style.display = "none";
        // camera on
        client.publish('camera/on', "start");
    }
    else {

        if (customOption) {
            customFriend = null
            customOption = false
        }

        memo_container.style.display = "none";
        // camera off
        client.publish('camera/close', 'ok')
    }
})

memo_write_button.addEventListener('click', showWrite);
memo_back_button.addEventListener('click', showStore);
for (let i = 0; i < save_button.length; i++) {
    save_button[i].addEventListener('click', function(e){saveMemoContent(e)});
}

shutter_button.addEventListener('click', () => {
    console.log('셔터 버튼 클릭')
    client.publish('capture/camera', "memo");
});


function saveMemoContent(e){
    if(e.target.id == "save_text_button"){
        hideKeyboard()
        mirror_db.addMemo(mirror_db.getId(), memo_textArea.value , 0, 'text')

        memo_textArea.value = "";
   }
   else if (e.target.id == "save_image_button"){

        if(e.target.id == "save_text_button"){
            hideKeyboard()
            let data = {
                id:mirror_db.getId(),
                content:memo_textArea.value,
                store:1,
                delete_time:"2026-04-04 4:44:44",
                time: time,
                type:"text"
            }
    
            mirror_db.createColumns('memo',data).
            then(()=>{
                memo_storage.showMemoStorage();
                memo_textArea.value = "";
            })
            
         
       }
       else if (e.target.id == "save_image_button"){
    


       }
    
    }

}

function showTextContent() {
    memo_text_content.style.display = "block";
    memo_image_content.style.display = "none";
    memo_record_content.style.display = "none";
}

function showImageContent() {
    memo_text_content.style.display = "none";
    memo_image_content.style.display = "block";
    memo_record_content.style.display = "none";
}

function showRecordContent() {
    memo_text_content.style.display = "none";
    memo_image_content.style.display = "none";
    memo_record_content.style.display = "block";
}

// Write Mode
function showWrite() {
    hideKeyboard()

    // 처음 메시지 창을 띄울 때 text content 부터 보여주기
    if(memo_back_button.style.display == "none"){
        memo_write_button.style.display = "none";
        memo_back_button.style.display = "block";
        memo_text.checked = true;
    }

    memo_write_button.style.display = "none";
    memo_back_button.style.display = "block";
    memo_player.style.display = "none";
    document.getElementById('memo_storage_view').style.display = "none";
    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".memo_option_radio");
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
function showStore() {
    hideKeyboard();
    memo_textArea.value = "";
    memo_player.style.display = "none";
    memo_write_button.style.display = "block";
    memo_back_button.style.display = "none";
    document.getElementById('memo_storage_view').style.display = "block";
    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".memo_option_radio");
    var sel_type = null;
    for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked == true) sel_type = radio[i].value;
    }

    if (sel_type == "text") {
        memo_text_content.style.display = "none";
        memo_image_content.style.display = "none";
        memo_record_content.style.display = "none";
    }
    else if (sel_type == "image") {
        memo_text_content.style.display = "none";
        memo_image_content.style.display = "none";
        memo_record_content.style.display = "none";
    }
    else { // sel_type == "record"
        memo_text_content.style.display = "none";
        memo_image_content.style.display = "none";
        memo_record_content.style.display = "none";
    }
}

// radio button
memo_text.addEventListener('change', () => {
    if (memo_write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
memo_image.addEventListener('change', () => {
    if (memo_write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
memo_record.addEventListener('change', () => {
    console.log("memo record click!!")
    if (memo_write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})

function showKeyboard(e) {

    if(keyboardTarget.keyboard.style.display == "none"){
        keyboardTarget.setCurrentTarget(e.target.id);
        keyboardTarget.keyboard.style.display = "block";
    }
}

function hideKeyboard() {
    keyboardTarget.setCurrentTarget(null);
    keyboardTarget.keyboard.style.display = "none";
}