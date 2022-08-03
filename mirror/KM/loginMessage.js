const remote = require('electron').remote;
function createLoginMessage(user){

        var loginMessageDiv = document.createElement("div")
        loginMessageDiv.setAttribute("id", "loginMessageDiv")
        loginMessageDiv.setAttribute("width","200px")
        loginMessageDiv.setAttribute("height","100px")
    //이미지 생성
    if(user != 0){
        loginMessageDiv.innerHTML=  user + "님 환영합니다."   
       // remote.getCurrentWindow().loadFile('index.html');
        
    }
    else{
        loginMessageDiv.innerHTML=  "등록된 사용자가 아닙니다."
    }
   
    var div = document.getElementById("loginMessage")
    div.appendChild(loginMessageDiv)
}

module.exports = createLoginMessage
