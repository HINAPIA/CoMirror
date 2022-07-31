const dbAccess = require('./mirror_db.js')

/* mysql의 행의 변화(삭제, 삽입, 수정)가 생겼을 때 이벤트 처리 기능 */
var MySQLEvents = require('mysql-events');
// 데이터베이스 연결
var dsn = {
    host: 'localhost',
    user: 'root',
    password: '1234',
};
var mysqlEventWatcher = MySQLEvents(dsn);
// watcher 은 감시자
var watcher = mysqlEventWatcher.add(
    // mirror_db라는 DB에서 memo라는 테이블의 변화가 생겼을 때를 감지하게 설정
    'mirror_db.memo',
    function (oldRow, newRow, event) {
        // 행이 삽입됬을 때 호출
        if (oldRow === null) {
            setUI();
            memo_ui.load(location.href+" "+memo_ui);
            //location.reload();
        }

        // 행이 삭제됬을 때 호출
        if (newRow === null) {
            console.log('delete');
            setUI();
            memo_ui.load(location.href+memo_ui);
            //location.reload();
        }
    },
    'Active'
);


/* 메모 ui를 형성 */

// memo ui를 자식 요소로 삽입할 class
const memo_ui = document.getElementsByClassName('memo_ui');

// 전체 memo ui 설정
const setUI = function () {
    // 기존에 memo_ui 모두 삭제
    memo_ui[0].innerHTML = "";

    // memo전체를 select 문으로 가져와 contents를 ui로 띄우기
    dbAccess.select('*', 'memo', `user_id=${dbAccess.userId}`)
        .then(value => {
            for (let i = 0; i < value.length; i++) {
                add_memo_ui(value[i].contents, value[i].seq);
            }
        });
}

//content, seq를 받아 memo ui 생성 함수 
const add_memo_ui = function (content, seq) {
    const memo = document.createElement('div');
    memo.id = seq;
    memo.innerText = content;
    memo_ui[0].append(memo);
}


setUI();