const dbAccess = require('./mirror_db.js')

console.log('sticker.js || call');

// memo ui를 자식 요소로 삽입할 class
const myMemo = document.getElementById('myMemo');
const sendMemo = document.getElementById('sendMemo');

/* mysql의 행의 변화(삭제, 삽입, 수정)가 생겼을 때 이벤트 처리 기능 */
var MySQLEvents = require('mysql-events');
// 데이터베이스 연결
var dsn = {
    host: 'localhost',
    user: 'root',
    password: '1234',
};

console.log(dsn);

var mysqlEventWatcher = MySQLEvents(dsn);

console.log(mysqlEventWatcher);
// watcher 은 감시자
var watcher = mysqlEventWatcher.add(
    // mirror_db라는 DB에서 memo라는 테이블의 변화가 생겼을 때를 감지하게 설정
    'mirror_db.memo',

    function (oldRow, newRow, event) {
        // 행이 삽입됬을 때 호출
        if (oldRow === null) {
            console.log('sticker.js: start');
            setUI();
        }

        // 행이 삭제됬을 때 호출
        if (newRow === null) {
            console.log('sticker.js: delete');
            setUI();
        }
    },
    'Active'
);


/* 메모 ui를 형성 */

// 전체 memo ui 설정
const setUI = function () {
    // memo전체를 select 문으로 가져와 contents를 ui로 띄우기
    dbAccess.select('*', 'memo', `user_id=${dbAccess.userId}`)
        .then(value => {
             // 기존에 memo_ui 모두 삭제
            myMemo.innerHTML = "";
            sendMemo.innerHTML = "";
            for (let i = 0; i < value.length; i++) {
                add_memo_ui(value[i].contents, value[i].from);
            }
            // html에서 id memo_ui을 새로운 페이지로 변경(reload 비슷한 개념)
            // replace = 기존페이지를 새로운 페이지로 변경
            location.replace(location.href + '#memo_ui');
        })

}

//content, seq를 받아 memo ui 생성 함수 
const add_memo_ui = function (content, from) {
    const memo = document.createElement('div');
    memo.innerText = content;
    console.log('from ||' + from);
    if(from == null)
        myMemo.prepend(memo);
    else{
        sendMemo.prepend(memo);
        const memoFrom = document.createElement('span');
        memoFrom.innerText = `[  ` + from +` ]`;
        sendMemo.prepend(memoFrom);
    }
}


setUI();