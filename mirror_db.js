/* 모듈 사용할 객체 */
let dbAccess = {};

// mysql 모듈 불러오기
var mysql = require('mysql');
//require('date-utils');

/* 연결 설정 */
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'mirror_db',
    debug: false,
    dateStrings : 'date'
});


/* 테이블 columns 제작 (insert 문) */
const createColumns = (table_name, data) => new Promise((resolve, reject) => {

    console.log('sql call');
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

                console.log(err.stack);
                // promise 실패 함수 reject 호출
                reject(err);
            }
            // sql문 실행 성공 
            if (result)
                console.log('insert || insert Success');
            else
                console.log('insert || insert Fail');
            // promise 성공 함수 resolve 호출
            resolve(result);
        });
    })
});

// 모듈로 createColumns 사용 하기 위해 dbAccess에 추가
dbAccess.createColumns = createColumns;


/* sql문 실행 */
const practiceSql = (sql) => new Promise((resolve, reject) => {

    console.log('createColumns call');
    // 커넥션 풀에 연결 객체 가져오기
    pool.getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            // db연결 실패 함수 reject 호출
            reject(err);

        }
        console.log("data base connected id: " + conn.threadId);

        //sql문 실행
        var exec = conn.query(sql, function (err, result) {
            conn.release(); // 반드시 해제 해야함
            console.log('SQL : ' + exec.sql);

            // sql문 실행 중 error 발생
            if (err) {
                console.log('SQL error');

                console.log(err.stack);
                // promise 실패 함수 reject 호출
                reject(err);
            }
            // sql문 실행 성공 
            if (result)
                console.log('SQL Success');
            else
                console.log('SQL Fail');
            // promise 성공 함수 resolve 호출
            resolve(result);
        });
    })
});

const selectColumns = (select, from, where) => new Promise((resolve, reject) => {
    practiceSql(`select ${select} from ${from} where ${where}`)
    .then(value => {
        // sql문 실행 성공 
        if (value)
            console.log('select || select Success');
        else
            console.log('select || select Fail');
        // promise 성공 함수 resolve 호출
        resolve(value);
    })
});

// 모듈로 selectColumns도 사용 하기 위해 dbAccess에 추가
dbAccess.select = selectColumns;

const updateColumns = (table_name, set, where) => new Promise((resolve, reject) => {
    practiceSql(`update ${table_name} set ${set} where ${where}`)
    .then(value => {
        // sql문 실행 성공 
        if (value)
            console.log('update || update Success');
        else
            console.log('update || update Fail');
        // promise 성공 함수 resolve 호출
        resolve(value);
    })
});

// 모듈로 updateColumns도 사용 하기 위해 dbAccess에 추가
dbAccess.update = updateColumns;

const deleteColumns = (table_name, where) => new Promise((resolve, reject) => {
    practiceSql(`DELETE FROM ${table_name} WHERE ${where}`)
    .then(value => {
        // sql문 실행 성공 
        if (value)
            console.log('delete || delete Success');
        else
            console.log('delete || delete Fail');
        // promise 성공 함수 resolve 호출
        resolve(value);
    })
});

// 모듈로 updateColumns도 사용 하기 위해 dbAccess에 추가
dbAccess.delete = deleteColumns;

/* 사용자를 등록하는 함수 (user table에 새로운 columns insert) */
const addUser = (name) => new Promise((resolve, reject) => {
    // db 연결 설정이 제대로 안됐을 경우 
    if (!pool) {
        console.log('error');
        return;
    }
    console.log('addUser call');

    // user table 제작에 필요한 column을 데이터 객체로 형성
    var data = { name: name };

    // user 행 제작
    createColumns('user', data)
        .then(result => {
            if (result) {
                selectColumns('id', 'user', `name='${name}'`)
                    .then(value => {
                        console.log('dv: ' + parseInt(value[value.length - 1].user_id));
                        resolve(String(value[value.length - 1].user_id));
                    });
            }
            else {
                reject(null);
            }
        });
});

dbAccess.addUser = addUser;

/* 메모 생성하는 함수 (memo table에 새로운 columns insert) */
dbAccess.addMemo = function (user_id, from, contents, store) {
    // db 연결 설정이 제대로 안됐을 경우 
    if (!pool) {
        console.log('error');
        return;
    }

    console.log('addMemo call');

    /* delete time 설정 */
    // 현재 시간 가져오기
    // var newDate = new Date();
    // // delecte_time 형식 지정
    // var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');

    // memo table 제작에 필요한 column을 데이터 객체로 형성
    var data = { user_id: user_id, from: from, contents: contents, store: store, delete_time: time };
    // memo 행 제작
    createColumns('memo', data);
}

// mirror 사용자 id
let id = 1001;
// 모듈로 userId도 사용 하기 위해 dbAccess에 추가
dbAccess.id = id;

// mirror 사용자 이름
let userName;

/* user id 설정과 user id에 따른 name 설정 */
dbAccess.setUser = function (id) {
    dbAccess.id = id;
    selectColumns('name', 'user', `id=${id}`)
        .then(value => {
            userName = value[0].name;
            console.log('userName1:' + userName);
            // 모듈로 name도 사용 하기 위해 dbAccess에 추가
            dbAccess.userName = userName;
            console.log('setUSUser: '+id+" | "+userName);
            //document.location.href='index.html'
        })
}
dbAccess.getId = () => id;


dbAccess.setUser('1001');
/* dbAccess 객체를 모듈화 */
module.exports = dbAccess;