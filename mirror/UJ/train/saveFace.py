from genericpath import exists
import cv2
import numpy as np
import os
import os.path
face_classifier = cv2.CascadeClassifier(cv2.data.haarcascades +'haarcascade_frontalface_default.xml')

def face_extractor(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_classifier.detectMultiScale(gray,1.3,5)

    #찾는 얼굴이 없으면 None Return
    if faces is():
        return None
    
    for(x,y,w,h) in faces:
        cropped_face=img[y:y+h, x:x+w]

    return cropped_face

cam=cv2.VideoCapture(1)
cam.set(cv2.CAP_PROP_FRAME_WIDTH, 1980)
cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

minW = 0.1 * cam.get(cv2.CAP_PROP_FRAME_WIDTH)
minH = 0.1 * cam.get(cv2.CAP_PROP_FRAME_HEIGHT)

def saveFile(userName):
    
   # print("현재 위치" + os.getcwdb())
    dir_path = './face/train/'+ userName
    count = 0
    #폴더 생성
    if not (os.path.exists(dir_path)):
        os.mkdir(dir_path)
        print(dir_path +"폴더생성 완료")
    while True:
        ret, frame = cam.read()
        if face_extractor(frame) is not None:
            count += 1
            
            face = cv2.resize(face_extractor(frame), (160, 160))
            face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
            file_name_path =  str(count) + '.jpg'
            cv2.imwrite(dir_path + '/'+file_name_path, face)

            # cv2.putText(face, str(count), (50, 50), cv2.FONT_HERSHEY_COMPLEX,1,(0,255,0),2)
            cv2.imshow('Face Cropper',face)
        else:
            print("Face not Found")
            pass

        if cv2.waitKey(1) == 13 or count == 40:
            break

    cam.release()
    cv2.destroyAllWindows()
    print('Collecting Samples Complete!')

saveFile("CW")