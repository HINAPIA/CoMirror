/* 모듈 사용할 객체 */
let dbAccess = {};

// mysql 모듈 불러오기
var mysql = require('mysql');
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
var createColumns = function (table_name, data) {
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

/* 테이블 columns 찾기 (update 문) */
var updateColumns = function (table_name, set, where) {
    console.log('insert || updateColumns call');
    const updatePromise = new Promise((resolve, reject) => {
        // 커넥션 풀에 연결 객체 가져오기
        pool.getConnection(function (err, conn) {
            if (err) {
                if (conn) {
                    conn.release();
                }
                // db연결 실패 함수 reject 호출
                reject(err);
            }
            console.log("update || data base connected id: " + conn.threadId);

            //sql문 실행 (update 문)
            var exec = conn.query(`update ${table_name} set ${set} where ${where}`, function (err, result) {
                conn.release(); // 반드시 해제 해야함
                console.log('update || sql : ' + exec.sql);

                // sql문 실행 중 error 발생
                if (err) {
                    console.log('update || SQL error');
                    console.log('update || sql : ' + exec.sql);
                    // promise 실패 함수 reject 호출
                    reject(err);
                }
                // sql문 실행 성공 
                // promise 성공 함수 resolve 호출
                resolve(result);
            });
        })
    });
    updatePromise
        // then -> promise가 resolve를 호출(성공)했을 때 실행
        .then(value => {
            // value는 sql문 실행 후 리턴 값 -> update문: 성공, 실패로 값을 리턴
            if (value)
                console.log('update || update Success');
            else
                console.log('update || update Fail');
        })
        // then -> promise가 reject를 호출(실패)했을 때 실행
        .catch(err => {
            console.log(err.stack);
        })
    return;
}

// 모듈로 selectColumns도 사용 하기 위해 dbAccess에 추가
dbAccess.update = updateColumns;


/* 사용자를 등록하는 함수 (user table에 새로운 columns insert) */
dbAccess.addUser = function (name) {
    // db 연결 설정이 제대로 안됐을 경우 
    if (!pool) {
        console.log('error');
        return;
    }
    console.log('addUser call');



    // user table 제작에 필요한 column을 데이터 객체로 형성
    var data = { name: name };

    // user 행 제작
    createColumns('user', data);
}

/* 메모 생성하는 함수 (memo table에 새로운 columns insert) */
dbAccess.addMemo = function (user_id, from, contents, store) {
    // db 연결 설정이 제대로 안됐을 경우 
    if (!pool) {
        console.log('error');
        return;
    }

    console.log('addMemo call');

    // memo table 제작에 필요한 column을 데이터 객체로 형성
    var data = { user_id: user_id, from: from, contents: contents, store: store, delete_time: time };
    // memo 행 제작
    createColumns('memo', data);
}

// mirror 사용자 id
let userId = 1;
// 모듈로 userId도 사용 하기 위해 dbAccess에 추가
dbAccess.userId = userId;

// mirror 사용자 이름
let userName;

/* user id 설정과 user id에 따른 name 설정 */
dbAccess.setUser = function (user_id) {
    selectColumns('name', 'user', `user_id=${user_id}`)
        .then(value => {
            userName = value[0].name;
            console.log('userName1:' + userName);
            // 모듈로 name도 사용 하기 위해 dbAccess에 추가
            dbAccess.userName = userName;
        })
}

dbAccess.setUser(userId);


if (pool) {
    dbAccess.addUser('KyungMi');
}

/* dbAccess 객체를 모듈화 */
module.exports = dbAccess;

