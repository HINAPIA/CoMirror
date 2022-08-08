const mqtt = require('mqtt')
const spawn = require('child_process').spawn;
const createLoginMessage = require('./loginMessage')

const options = {
    host: '127.0.0.1',
    port: 1883
  };
  
  const client = mqtt.connect(options);

  client.subscribe("loginCheck")
  client.subscribe('createAccount/check')

  client.on('message', (topic, message, packet) => {
    console.log("message is "+ message);
    console.log("topic is "+ topic);
    

    //서버에서 로그인을 하고 신호가 들어옴
    if(topic == "loginCheck"){
      console.log("topic == loginCheck")
      createLoginMessage(message)
    }

    //서버에서 계정을 추가하고 신호가 올 때
    if(topic == "createAccount/check"){
      console.log("topic == createAccount/check")
      
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