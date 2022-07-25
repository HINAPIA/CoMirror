// mysql 모듈 불러오기
var mysql = require('mysql');

// 연결 설정
var pool = mysql.createPool({
    connectionLimit: 10,
    host:'localhost',
    user:'root',
    password:'1234',
    database:'mirror_db',
    debug:false
});

// columns 생성
var createColumns = function(data, table_name, callback) {
    console.log('addUser call');

// 커넥션 풀에 연결 객체 가져오기
pool.getConnection(function(err,conn){
    if(err){
        if(conn){
            conn.release();
        }
        callback(err,null);
        return;
    }
    console.log("data base connected id: "+conn.threadId);

    //sql문 실행
    var exec=conn.query(`insert into ${table_name} set ?`, data, function(err, result){
        conn.release(); // 반드시 해제 해야함
        console.log('sql : '+exec.sql);

        if(err){
            console.log('SQL error');

            callback(err, null);
            return;
        }
        callback(null,result);
    });
});
}

// 사용자를 등록하는 함수
var addUser = function(user_id, name) {
    console.log('addUser call');

    //데이터 객체로
    var data={user_id:user_id, name:name};
    createColumns(data,'user', function(err,addedUser){
        if(err){
            console.log(err.stack);
            return;
        }
        if(addedUser){
            console.log('insert');
        }
        else{
            console.log('insert fail');
        }
    });
}

// 메모 생성하는 함수
var addMemo = function(user_id, seq, contents, store, delete_time){
    console.log('addMemo call');

    //데이터 객체로
    var data={user_id:user_id, seq:seq, contents:contents, store:store, delete_time:delete_time};

    createColumns(data, 'memo',function(err,addedUser){
        if(err){
            console.log(err.stack);
            return;
        }
        if(addedUser){
            console.log('insert');
        }
        else{
            console.log('insert fail');
        }
    });
}

if(pool){
    addUser('2071','김경미');
}