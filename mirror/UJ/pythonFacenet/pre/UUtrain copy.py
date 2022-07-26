import cv2
import numpy as np
from os import listdir, makedirs
from os.path import isfile, join
import webbrowser
from os.path import isdir
import os

#얼굴 저장
face_dirs = 'faces/'

face_classifier = cv2.CascadeClassifier(cv2.data.haarcascades +'haarcascade_frontalface_default.xml')

#얼굴 검출 함수
def face_extractor(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_classifier.detectMultiScale(gray,1.3,5)

    # 얼굴이 없으면 패스!
    if faces is():
        return None
    # 얼굴이 있으면 얼굴 부위만 이미지로 만들고
    for(x,y,w,h) in faces:
        cropped_face=img[y:y+h, x:x+w]

    return cropped_face

#해당하는 id 폴더가 없으면 생성
# name = input("id 입력하세요")
# if not isdir(face_dirs + name):
#     makedirs(face_dirs + name)

#내장카메라 있을 경우, 내장 0, 외장 1
#내장카메라 없을 경우, 외장 0
cap=cv2.VideoCapture(1)
count = 0

while True:
    #카메라로부터 사진 한장 읽어 오기
    ret, frame = cap.read()

    #사진에서 얼굴 검출, 얼굴이 검출되었다면
    if face_extractor(frame) is not None:
        count += 1
        # 200 x 200 사이즈로 줄이거나 늘린다음
        face = cv2.resize(face_extractor(frame), (200, 200))
        # 흑백으로 바꿈
        face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
        # 200x200 흑백 사진을 faces/얼굴 이름/userxx.jpg 로 저장
        file_name_path = face_dirs + '/user' + str(count) + '.jpg'
        cv2.imwrite(file_name_path, face)

        cv2.putText(face, str(count), (50, 50), cv2.FONT_HERSHEY_COMPLEX,1,(0,255,0),2)
        cv2.imshow('Face Cropper',face)
    else:
        print("Face not Found")
        pass

    # 얼굴 사진 100장을 다 얻었거나 enter키 누르면 종료
    if cv2.waitKey(1) == 13 or count == 100:
        break

cap.release()
cv2.destroyAllWindows()
print('Collecting Samples Complete!')



# Training 시작
data_path='faces/'
onlyfiles=[f for f in listdir(data_path) if isfile(join(data_path,f))]

Training_data, Labels = [],[]

for i, files in enumerate(onlyfiles):
    image_path = data_path + onlyfiles[i]
    images = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    Training_data.append(np.asarray(images, dtype = np.uint8))
    Labels.append(i)

Labels = np.asarray(Labels, dtype=np.int32)
Labels.dtype = np.int32

model = cv2.face.LBPHFaceRecognizer_create()
# model.read('trainer/trainer.yml')

model.train(np.asarray(Training_data), np.asarray(Labels))

name = input('name >> ')
if os.path.exists('./trainer/' + name + '_trainer.yml') :
    model.write('trainer/'+ name +'_trainer.yml')
    print('생성')
else :
    model.write('trainer/'+ name +'_trainer.yml')
    print('쓰기')

print("Model Training Complete!!")




#https://velog.io/@huttzza/%EC%8B%A4%EC%8B%9C%EA%B0%84-%EC%96%BC%EA%B5%B4-%EC%9D%B8%EC%8B%9D-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%A8-1%EC%B0%A8-%EA%B5%AC%ED%98%84
#출처