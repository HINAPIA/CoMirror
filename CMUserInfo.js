
let CMUsers = {};

let nextIndex = 0;
let users = [{}];
let startOtherIndex;
let checkConnectedUser = [];

CMUsers.users = users;
CMUsers.getCMUsers = () => users;

function setCMUserList(){ 
     
    console.log("거울 내 사용자 목록 불러오기");
    users = [{}];
    nextIndex = 0;
    startOtherIndex = 0;

    dbAccess.select('id, name', 'user', `id <> ${dbAccess.userId}`) // 현재 사용자가 아닌 다른 사용자 User DB 정보 불러오기
            .then(value => { // users에 값 넣기
                    let i = 0;
                    for (i = 0; i < value.length; i++) { // 미러내 유저
                        users[i] = { "id":value[i].id, "name":value[i].name, "connect":0};
                    } 
                    startOtherIndex = i; // 처음으로 다른 CM 유저 정보 들어있는 index
                    nextIndex = i; // 처음으로 다른 CM 유저 정보 들어있는 index
                }
            );
}
CMUsers.setCMUserList = setCMUserList;

function setFriendList(){
    console.log("거울 외부 사용자 목록 불러오기");
    dbAccess.select('id, name','friend','id <> 22')
                    .then(value => { // users에 값 넣기
                            for (let k = 0; k < value.length; k++,nextIndex++) {
                                users[nextIndex] = { "id":value[k].id, "name":value[k].name,"connect":0};
                                checkConnectedUser[k] = users[nextIndex].id; //서버로 보내서 connect 확인할 친구 목록
                            }   
                        }
                    )
                    .then(()=>{
                        console.log("여기가 먼저 불려야함");
                        axios({
                            method:'post',
                            url:'http://localhost:9000/connect/user',
                            data: {
                                userData:checkConnectedUser
                            }
                        })
                        .then(response=>{
                            let results = response.data.result;
                            for(let i=0;i<results.length;i++,startOtherIndex++){
                                if (users[startOtherIndex].id == results[i].user)
                                    users[startOtherIndex].connect = results[i].connect;
                            }
                        })
                    })
                    .catch(
                        ()=>{
                            console.log("server state 테이블에서 정보를 가져오지 못함");
                        }
                    ); 
}
CMUsers.setFriendList = setFriendList;

module.exports = CMUsers;

