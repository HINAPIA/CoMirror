// 모듈 사용할 객체
let dbAccess = {};
let userId = 1;
// mysql 모듈 불러오기
var mysql = require('mysql');
var MySQLEvents = require('mysql-events');
require('date-utils');

// 연결 설정
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'mirror_db',
    debug: false
});

// 테이블 columns 제작 (insert 문)
var createColumns = function (data, table_name) {
    console.log('insert || createColumns call');

    const createPromise = new Promise((resolve, reject) => {
        // 커넥션 풀에 연결 객체 가져오기
        pool.getConnection(function (err, conn) {
            if (err) {
                if (conn) {
                    conn.release();
                }
                reject(err);

            }
            console.log("insert || data base connected id: " + conn.threadId);

            //sql문 실행
            var exec = conn.query(`insert into ${table_name} set ?`, data, function (err, result) {
                conn.release(); // 반드시 해제 해야함
                console.log('insert || sql : ' + exec.sql);

                if (err) {
                    console.log('insert || SQL error');
                    reject(err);
                }
                resolve(result);
            });
        });
    });
    createPromise
        .then(value => {
            if (value)
                console.log('insert || insert Success');
            else
                console.log('insert || insert Fail');
        })
        .catch(err => {
            console.log(err.stack);
        })
    return;
}

// 테이블 columns 찾기 (select 문)
const selectColumns = (select, from, where) => new Promise((resolve, reject) => {
    console.log('select || selectColumns call');
    pool.getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            reject(err);
        }
        console.log("select || data base connected id: " + conn.threadId);

        //sql문 실행
        var exec = conn.query(`select ${select} from ${from} where ${where}`, function (err, result) {
            conn.release(); // 반드시 해제 해야함
            console.log('select || sql : ' + exec.sql);

            if (result.length < 0) {
                console.log('select || SQL error');
                resolve(null);
            }
            else if (result.length == 0) {
                console.log('select || select zero');
                resolve(result);
            }
            else {
                console.log('select || select Success');
                resolve(result);
            }
        });
    });
});

dbAccess.select = selectColumns;

// 사용자를 등록하는 함수 (user table에 새로운 columns insert)
dbAccess.addUser = function (user_id, name) {
    if (!pool) {
        console.log('error');
        return;
    }
    console.log('addUser call');

    //데이터 객체로
    var data = { user_id: user_id, name: name };
    createColumns(data, 'user',);
}

// 메모 생성하는 함수 (memo table에 새로운 columns insert)
dbAccess.addMemo = function (user_id, contents, store) {
    if (!pool) {
        console.log('error');
        return;
    }
    console.log('addMemo call');
    selectColumns('seq', 'memo',  `user_id=${user_id}`)
        .then(value => {
            // delete time 설정
            var newDate = new Date();
            var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');

            if (value.length == 0)
                value = value.length;
            else
                value = (value[value.length - 1].seq) + 1;

            add_memo_ui(contents, value);
            //데이터 객체
            var data = { user_id: user_id, seq: value, contents: contents, store: store, delete_time: time };
            createColumns(data, 'memo');
        });
}

const memo_ui = document.getElementsByClassName('memo_ui');

dbAccess.setUI = function () {
    memo_ui[0].innerHTML = "";
    selectColumns('*', 'memo', `user_id=${userId}`)
        .then(value => {
            for (let i = 0; i < value.length; i++) {
                add_memo_ui(value[i].contents, value[i].seq);
            }
        });
}

//insert 되면 ui 생성
const add_memo_ui = function (content, seq) {
    const memo = document.createElement('div');
    memo.id = seq;
    memo.innerText = content;
    memo_ui[0].append(memo);
}

// delete되면 ui에서 삭제
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
    'mirror_db',
    function (oldRow, newRow, event) {
        // 행 삽입
        if (oldRow === null) {
            // // 여기에 코드 삽입
            // dbAccess.setUI();
            // //memo_ui.load(location.href+" "+memo_ui);
            // location.reload();
        }

        // 삭제된 행
        if (newRow === null) {
            console.log('delete');
            dbAccess.setUI();
            //memo_ui.load(location.href+memo_ui);
            location.reload();
            // 삭제 코드가 여기에 갑니다.
        }
    },
    // ???
    'Active'
);


dbAccess.userId = userId;

module.exports = dbAccess;