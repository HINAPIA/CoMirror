const mqtt = require('mqtt')
const spawn = require('child_process').spawn;
const createLoginMessage = require('./loginMessage')

const options = {
    host: '192.168.137.160',
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
