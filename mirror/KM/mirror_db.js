let dbAccess = {};

// mysql 모듈 불러오기
var mysql = require('mysql');

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


const selectColumns = function (select, table_name, where) {

    const selectPromise = new Promise((resolve, reject) => {
        console.log('selectColumns call');

        // 커넥션 풀에 연결 객체 가져오기
        pool.getConnection(function (err, conn) {
            if (err) {
                if (conn) {
                    conn.release();
                }
                reject(err);
                //promise.reject(err);
            }
            console.log("data base connected id: " + conn.threadId);

            //sql문 실행
            var exec = conn.query(`select ${select} from ${table_name} where ${where}`, function (err, result) {
                conn.release(); // 반드시 해제 해야함
                console.log('sql : ' + exec.sql);

                if (result.length <= 0) {
                    console.log('SQL error');
                    resolve(null);
                }
                else {
                    resolve(result);
                }
            });
        });
    });
    selectPromise
        .then(value => {
            if (value) {
                console.log('then: ' + value.length);
                console.log('select');
                return value.length;
            }
            else {
                console.log('dont select');
                return null;
            }
        })
        .catch(err => {
            console.log(err.stack);
            return;
        })
}

dbAccess.selectColumns = selectColumns;

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
dbAccess.addMemo = function (user_id, contents, store, delete_time) {
    if (!pool) {
        console.log('error');
        return;
    }
    console.log('addMemo call');

    value = selectColumns('seq', 'memo', `user_id=${user_id}`);
    console.log('value: ' + value);
    //데이터 객체
    var data = { user_id: user_id, seq: value, contents: contents, store: store, delete_time: delete_time };

    createColumns(data, 'memo');
}
if (pool) {
    dbAccess.addMemo(1, '안녕', 0, 1);
}

module.exports = dbAccess;