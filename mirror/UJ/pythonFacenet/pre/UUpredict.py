import cv2
import numpy as np

recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read('trainer/trainer.yml')
cascadePath = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
faceCascade = cv2.CascadeClassifier(cascadePath)


font = cv2.FONT_HERSHEY_SIMPLEX

id = 0

names = ['aa','ss','dd','UU','CHAE']

cam = cv2.VideoCapture(1)

cam.set(cv2.CAP_PROP_FRAME_WIDTH, 1980)
cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

minW = 0.1 * cam.get(cv2.CAP_PROP_FRAME_WIDTH)
minH = 0.1 * cam.get(cv2.CAP_PROP_FRAME_HEIGHT)

while True:
    ret, img = cam.read() #얼굴 부분만 가져오기
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) # 얼굴 부분만 가져오기

    faces = faceCascade.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=6,
        minSize=(int(minW), int(minH))
    )

    for(x,y,w,h) in faces:
        cv2.rectangle(img, (x,y), (x+w,y+h), (0,255,0),2)
        id, confidence = recognizer.predict(gray[y:y+h, x:x+w]) #얼굴 부분만 가져와서 확인
        print(id)
        print(confidence)
        if confidence < 55 :
            id = names[id]
        else:
            id = "unknown"
        
        confidence = "  {0}%".format(round(100-confidence))

        cv2.putText(img,str(id), (x+5,y-5),font,1,(255,255,255),2)
        cv2.putText(img,str(confidence), (x+5,y+h-5),font,1,(255,255,0),1)
    
    cv2.imshow('camera',img)
    if cv2.waitKey(1) > 0 : break

print("\n [INFO] Exiting Program and cleanup stuff")
cam.release()
cv2.destroyAllWindows()