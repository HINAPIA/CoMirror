const mqtt = require('mqtt')
const spawn = require('child_process').spawn;
const createLoginMessage = require('./loginMessage')
const _db = require('./mirror_db')
const options = {
    host: '127.0.0.1',
    port: 1883
  };
  
  const client = mqtt.connect(options);

  client.subscribe("loginCheck")
  client.subscribe('createAccount/check')
  client.subscribe('exist/check')

  client.on('message', (topic, message, packet) => {
    console.log("message is "+ message);
    console.log("topic is "+ topic);
    
    if(topic == "exist/check"){
      user_id = String(message)
      if(user_id == 'NULL'){
        //회원가입 하게 만들기
        document.location.href='createAccount.html'
      }
      else{
        _db.select('name', 'user', `user_id =${user_id}`)
        .then(user_name =>{
          if(user_name.length>0) {
          createLoginMessage.createMessage(String(user_name[0].name) +'님은 이미 가입된 유저입니다.')
          }
          else {
            createLoginMessage.createMessage('넌 회원가입 안됨~~~~')
            //document.location.href='createAccount.html'
          }
        })
      }

    }
    //서버에서 로그인을 하고 신호가 들어옴
    if(topic == "loginCheck"){
      console.log("topic == loginCheck")
      user_id = String(message)
      console.log('loginCheck : 디비에서 이름 받아오기')
      if(user_id == 'NULL'){
        createLoginMessage.createLoginMessage('NULL')
      }
      else{
        //client.publish('createAccount/start')
        _db.select('name', 'user', `user_id =${user_id}`)
        .then(user_name =>{
          if(user_name.length>0) {
              createLoginMessage.createLoginMessage(String(user_name[0].name))
              _db.setUser(user_id)
          }
          else {
            createLoginMessage.createMessage('삭제된 유저입니다.');
          }
          
        })
      } 
    }

    //서버에서 계정을 추가하고 신호가 올 때
    if(topic == "createAccount/check"){
      console.log("topic == createAccount/check")


      var createMessageDiv = document.createElement("div")
      createMessageDiv.setAttribute("id", "createMessageDiv")
      createMessageDiv.setAttribute("width","500px")
      createMessageDiv.setAttribute("height","100px")
      createMessageDiv.setAttribute("style", "text-align=center;")
      //이미지 생성

      createMessageDiv.innerHTML= '등록되었습니다.'
        // remote.getCurrentWindow().loadFile('index.html');

      var div = document.getElementById("createAccountMessage")
      div.appendChild(createMessageDiv)
      console.log('등록되었습니다.')
      console.log(str(message))
      if(message == true)
        console.log('2222등록되었습니다.')
        //createLoginMessage('등록되었습니다.')
    }
  })



module.exports = client

// client.subscribe('distance_closer');
// client.subscribe('distance_far');

// 

// client.on('message', function(topic, message){
//     if(topic.toString() == 'distance_closer'){
//         console.log(message.toString())

//         // const result = spawn('python', ['createAccount.py']);
//         // result.stdout.on('data', function(data) {
//         //     console.log(data.toString());
//         // });
//     }
//     else if(topic.toString() == 'distance_far'){
        
//     }
// });