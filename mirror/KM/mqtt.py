from re import T
import paho.mqtt.client as mqtt
from crop import createCropImage
import os
import byteList
global client

curDir = os.path.dirname(os.path.realpath(__file__))
    #curDir = '.' + os.path.sep + 'faceRecognition'
os.chdir(curDir)

new_account_flag = False
login_flag = False
loginCamera_flag = False
createAccountCamera_flag = False
user_id = ''
def on_connect(client, userdata, flag, rc):
    print("Connect with result code:"+ str(rc))
    client.subscribe('loginCamera')
    client.subscribe('createAccountCamera')

def on_message(client, userdata, msg):
    message = msg.payload.decode("utf-8")
    print("payload : " + str(message))
    if(msg.topic == 'loginCamera'):
        print("topic : " + msg.topic)
        if(str(message) == 'login'):
            global loginCamera_flag
            loginCamera_flag = True
    if(msg.topic == 'createAccountCamera'):
        print("topic : " + msg.topic)
        global user_id
        user_id = str(message)
        global createAccountCamera_flag
        createAccountCamera_flag = True
            
       
broker_ip = "localhost" # 현재 이 컴퓨터를 브로커로 설정
print('broker_ip : ' + broker_ip)
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(broker_ip, 1883)
client.loop_start()

def loginCamera_login(count):
    print('while - loginCamera')
    # 카메라로 사진 찍어서 얼굴부분만 크롭해서 저장
    dir_name1 = os.path.join('face','login')
    dir_name2 = os.path.join('face','login','user')
    createCropImage('user',  dir_name1, count)
    # 사진 넘겨주기
    imagelist = byteList.load_image(dir_name2)
    for i in range(count) :
        imageByte = imagelist.pop()
        client.publish('login', imageByte)


def loginCamera_createAccount(username, count):
    print('while - createAccount')
    # 카메라로 사진 찍어서 얼굴부분만 크롭해서 저장
    dir_name1 = os.path.join('face','train')
    dir_name2 = os.path.join('face','train', username)
    createCropImage(username,  dir_name1, count)
    # 사진 넘겨주기
    imagelist = byteList.load_image(dir_name2)
    for i in range(count) :
        imageByte = imagelist.pop()
        # 서버에 보냄   
        client.publish('createAccount/image', imageByte)

stopFlag = False
while True :
    if (loginCamera_flag):
        loginCamera_login(10)
        loginCamera_flag = False
    if(createAccountCamera_flag):
        
        if not (user_id == ''):
            print('user : ' + user_id)
            # 시퀀스 받아와서 id 주기
            # 파이에게 계정 생성하라고 pub
            client.publish('createAccount/start', user_id)
            loginCamera_createAccount(user_id,20)
            createAccountCamera_flag = False
    if (stopFlag):
        break
   
print('끝내기')
client.loop_stop()
client.disconnect()
