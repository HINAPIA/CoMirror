const dbAccess = require('./mirror_db.js')

dbAccess.setUI();

const mqtt = require('mqtt')

document.getElementById("apply").addEventListener("click",setIsAddableDB);
document.getElementById("cancle").addEventListener("click",setIsAddableDB);
let ul = document.getElementById('otherUserList');

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
        currentMsg = message.toString();
        const user_id = 1;
        const contents = message.toString();
        const store = 0;
        dbAccess.addMemo(user_id, contents, store);
        isAddableDB = false;
        }
    }
});


function setIsAddableDB(){
    isAddableDB = true;
    console.log("song//set isAddableDB: " + isAddableDB);
    document.getElementById("memoDiv").style.visibility = "hidden";
    document.getElementById("memo").innerHTML = "";
}


function insertOtherUserDB(user){
    let contents = currentMsg;
    dbAccess.addMemo(user.user_id,contents,0);
    currentMsg = "";

    while (ul.hasChildNodes()) {
        ul.removeChild(ul.firstChild);
    }
    setIsAddableDB();
}

function submitMemo(){
    console.log("func submitMemo start"); 
    dbAccess.select('user_id, name', 'user', `user_id <> ${dbAccess.userId}`)
        .then(value => {
            for (let i = 0; i < value.length; i++) {
                users[i] = { "user_id":value[i].user_id, "name":value[i].name};
            }  
            showOtherUsers();          
        }
    );
}

function showOtherUsers(){
    
    for(let i=0;i<users.length;i++){
        let li = document.createElement("li");
        const textNode = document.createTextNode(users[i].name);
        li.appendChild(textNode);
        li.addEventListener("click",  function(){insertOtherUserDB(users[i])});
        ul.appendChild(li);
    }
}