/* Section1. 필요한 모듈 require */

const dbAccess = require('./mirror_db.js')
const mqtt = require('mqtt')


/* Section2. 변수 초기화 및 이벤트 리스너 추가 */

let currentMsg = ""; // 현재(전송할) 메시지
let users = [{}]; // 다른 사용자 DB (User Table) 정보([{user_id, name}])
let isAddableDB = true; // 메모를 DB에 추가할 수 있는지 여부
let ul = document.getElementById('otherUserList'); // 전송할 사용자 목록

document.getElementById("apply").addEventListener("click",submitMemo); // 전송 버튼
document.getElementById("cancle").addEventListener("click",setIsAddableDB); // 닫기 버튼


/* Section3. mqtt 브로커 연결 및 topic subscribe */

const options = { // 브로커 정보(ip, port)
    host: '127.0.0.1',
    port: 1883
};

const client = mqtt.connect(options); // mqtt broker 연결
client.subscribe('create_memo'); //토픽 구독(처음 메모 생성)
client.subscribe('memo_content'); // 토픽 구독(남길 메모 내용)

client.on('message', function (topic, message) { // 메시지 받았을 때 callback
    if (topic.toString() == 'create_memo') { // 메모 생성 직후
        document.getElementById('callImg').style.visibility = "visible";
        document.getElementById("memoDiv").style.visibility = "hidden";
        document.getElementById("memo").innerHTML = '남길 메모를 말해주세요';
    }
    else if (topic.toString() == 'memo_content') { // 사용자가 남길 메모 말했을 때
        if (isAddableDB == true){ // DB에 넣을 수 있는지 여부 확인
           /* UI 설정 */
            document.getElementById('callImg').style.visibility = "hidden";
            document.getElementById('memoDiv').style.visibility = "visible";
            document.getElementById("memo").innerHTML = `메모 내용: \"${message.toString()}\"`;
            
            /* 현재 user DB에 insert */
            const user_id = 1;
            const contents = message.toString();
            currentMsg = message.toString(); //..필요할까 고민...
            const store = 0; 
            dbAccess.addMemo(user_id, contents, store);
            isAddableDB = false; // 전송이나 취소 버튼을 누를 때까지 db insert 못함
        }
    }
});


/* Section4. 전송 버튼 및 닫기 버튼 공통 기능 */

function setIsAddableDB(){ // 메모를 DB에 추가할 수 있는지 여부 설정
    isAddableDB = true;
    document.getElementById("memoDiv").style.visibility = "hidden";
    document.getElementById("memo").innerHTML = "";
}


/* Section5. 전송 버튼 클릭 시 기능 */

// User DB 접근 및 users 초기화
function submitMemo(){ 
    dbAccess.select('user_id, name', 'user', `user_id <> ${dbAccess.userId}`) // 현재 사용자가 아닌 다른 사용자 User DB 정보 불러오기
        .then(value => { // users에 값 넣기
            for (let i = 0; i < value.length; i++) {
                users[i] = { "user_id":value[i].user_id, "name":value[i].name};
            }  
            showOtherUsers(); // user 목록 보여줌        
        }
    );
}

// 메모 전송 가능한 user 목록 보여주기
function showOtherUsers(){ 
    for(let i=0;i<users.length;i++){
        let li = document.createElement("li");
        const textNode = document.createTextNode(users[i].name);
        li.appendChild(textNode);
        li.addEventListener("click",  function(){insertOtherUserDB(users[i])}); // 각각의 li에 add onclick listener
        ul.appendChild(li);
    }
}

// 선택한 사용자 DB에 메모 insert
function insertOtherUserDB(user){ 
    let contents = currentMsg;
    dbAccess.addMemo(user.user_id,contents,0); 
    currentMsg = "";

    while (ul.hasChildNodes()) { // UI 초기화
        ul.removeChild(ul.firstChild);
    }
    setIsAddableDB();
}



