/* 모듈 사용할 객체 */
let dbAccess = {};

// mirror 사용자 id
let userId = 1;
// 모듈로 userId도 사용 하기 위해 dbAccess에 추가
dbAccess.userId = userId;

// mysql 모듈 불러오기
var mysql = require('mysql');
var MySQLEvents = require('mysql-events');
require('date-utils');

/* 연결 설정 */
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'mirror_db',
    debug: false
});

/* 테이블 columns 제작 (insert 문) */
var createColumns = function (data, table_name) {
    console.log('insert || createColumns call');
    const createPromise = new Promise((resolve, reject) => {
        // 커넥션 풀에 연결 객체 가져오기
        pool.getConnection(function (err, conn) {
            if (err) {
                if (conn) {
                    conn.release();
                }
                // db연결 실패 함수 reject 호출
                reject(err);

            }
            console.log("insert || data base connected id: " + conn.threadId);

            //sql문 실행(insert문)
            var exec = conn.query(`insert into ${table_name} set ?`, data, function (err, result) {
                conn.release(); // 반드시 해제 해야함
                console.log('insert || sql : ' + exec.sql);

                // sql문 실행 중 error 발생
                if (err) {
                    console.log('insert || SQL error');
                    // promise 실패 함수 reject 호출
                    reject(err);
                }
                // sql문 실행 성공 
                // promise 성공 함수 resolve 호출
                resolve(result);
            });
        });
    });
    createPromise
        // then -> promise가 resolve를 호출(성공)했을 때 실행
        .then(value => {
            // value는 sql문 실행 후 리턴 값 -> insert문: 성공, 실패로 값을 리턴
            if (value)
                console.log('insert || insert Success');
            else
                console.log('insert || insert Fail');
        })
        // then -> promise가 reject를 호출(실패)했을 때 실행
        .catch(err => {
            console.log(err.stack);
        })
    return;
}

/* 테이블 columns 찾기 (select 문) */
const selectColumns = (select, from, where) => new Promise((resolve, reject) => {
    console.log('select || selectColumns call');

    // 커넥션 풀에 연결 객체 가져오기
    pool.getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            // db연결 실패 함수 reject 호출
            reject(err);
        }
        console.log("select || data base connected id: " + conn.threadId);

        //sql문 실행 (select 문)
        var exec = conn.query(`select ${select} from ${from} where ${where}`, function (err, result) {
            conn.release(); // 반드시 해제 해야함
            console.log('select || sql : ' + exec.sql);

            // result = sql문 실행 후 리턴 값 
            // -> select문: select해서 얻은 행을 RowDataPacket으로 리턴
            // result.length = 행의 개수

            // 행이 0보다 작을 경우 = sql 문 에러
            if (result.length < 0) {
                console.log('select || SQL error');
                // promise 실패 함수 reject 호출
                resolve(null);
            }

            // 행이 0이거나 0보다 클 경우 = sql 제대로 실행
            else if (result.length == 0) {
                console.log('select || select zero');
                // promise 성공 함수 resolve 호출
                resolve(result);
            }
            else {
                console.log('select || select Success');
                // promise 성공 함수 resolve 호출
                resolve(result);
            }
        });
    });
});

// 모듈로 selectColumns도 사용 하기 위해 dbAccess에 추가
dbAccess.select = selectColumns;

/* 사용자를 등록하는 함수 (user table에 새로운 columns insert) */
dbAccess.addUser = function (user_id, name) {
    // db 연결 설정이 제대로 안됐을 경우 
    if (!pool) {
        console.log('error');
        return;
    }
    console.log('addUser call');

    // user table 제작에 필요한 column을 데이터 객체로 형성
    var data = { user_id: user_id, name: name };

    // user 행 제작
    createColumns(data, 'user',);
}

/* 메모 생성하는 함수 (memo table에 새로운 columns insert) */
dbAccess.addMemo = function (user_id, contents, store) {
    // db 연결 설정이 제대로 안됐을 경우 
    if (!pool) {
        console.log('error');
        return;
    }

    console.log('addMemo call');

    // seq를 알아내기 위해 select문 실행 (seq = 해당 유저에 memo 개수로 user_id와 함께 primary key)
    selectColumns('seq', 'memo',  `user_id=${user_id}`)
        // selectColumns를 다끝내고 처리하기 위해 then 이용 (동기 처리)
        // value -> select해서 얻은 행을 RowDataPacket
        .then(value => {

            /* delete time 설정 */
            // 현재 시간 가져오기
            var newDate = new Date();
            // delecte_time 형식 지정
            var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS'); 

            // value.length가 0일 경우 memo가 하나도 없는 것이므로 value.length를 seq로 설정
            if (value.length == 0)
                value = value.length;
            // 0이 아닐 경우 마지막 행의 seq 값의 + 1을 seq로 설정
            else
                value = (value[value.length - 1].seq) + 1;

            // memo_ui 추가
            //add_memo_ui(contents, value);
            
            // memo table 제작에 필요한 column을 데이터 객체로 형성
            var data = { user_id: user_id, seq: value, contents: contents, store: store, delete_time: time };
            // memo 행 제작
            createColumns(data, 'memo');
        });
}



/* dbAccess 객체를 모듈화 */
module.exports = dbAccess;