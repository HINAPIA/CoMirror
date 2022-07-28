let dbAccess = {};

// mysql 모듈 불러오기
var mysql = require('mysql');
require('date-utils')

// 연결 설정
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'mirror_db',
    debug: false
});

// columns 생성
var createColumns = function (data, table_name) {
    console.log('createColumns call');

    const createPromise = new Promise((resolve, reject) => {
        // 커넥션 풀에 연결 객체 가져오기
        pool.getConnection(function (err, conn) {
            if (err) {
                if (conn) {
                    conn.release();
                }
                reject(err);

            }
            console.log("data base connected id: " + conn.threadId);

            //sql문 실행
            var exec = conn.query(`insert into ${table_name} set ?`, data, function (err, result) {
                conn.release(); // 반드시 해제 해야함
                console.log('sql : ' + exec.sql);

                if (err) {
                    console.log('SQL error');
                    reject(err);
                }
                resolve(result);
            });
        });
    });
    createPromise
        .then(value => {
            if (value)
                console.log('insert');
            else
                console.log('insert fail');
        })
        .catch(err => {
            console.log(err.stack);
        })
    return;
}


const selectPromise = (select, from, where) => new Promise((resolve, reject) => {

    pool.getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            reject(err);
            //promise.reject(err);
        }
        console.log("select2 || data base connected id: " + conn.threadId);

        //sql문 실행
        var exec = conn.query(`select ${select} from ${from} where ${where}`, function (err, result) {
            conn.release(); // 반드시 해제 해야함
            console.log('select3 || sql : ' + exec.sql);

            if (result.length < 0) {
                console.log('select3 || SQL error');
                resolve(null);
            }
            else if (result.length == 0) {
                resolve(result);
            }
            else {
                resolve(result);
            }
        });
    });
});

dbAccess.select = selectPromise;

// 사용자를 등록하는 함수
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

// 메모 생성하는 함수
dbAccess.addMemo = function (user_id, contents, store) {
    if (!pool) {
        console.log('error');
        return;
    }
    console.log('addMemo call');
    selectPromise('seq', 'memo', 'user_id=1')
        .then(value => {
            console.log('value: ' + value);
            var newDate = new Date();
            var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');

            if(value.length==0)
                value = value.length;
            else
                value = (value[value.length-1].seq)+1;

            //데이터 객체
            var data = { user_id: user_id, seq: value, contents: contents, store: store, delete_time: time };
            createColumns(data, 'memo');
        });
}

module.exports = dbAccess;