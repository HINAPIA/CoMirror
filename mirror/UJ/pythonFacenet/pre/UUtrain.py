import cv2
import numpy as np
from os import listdir
from os.path import isfile, join
import webbrowser

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

cap=cv2.VideoCapture(0)
count = 0

while True:
    ret, frame = cap.read()
    if face_extractor(frame) is not None:
        count += 1
        face = cv2.resize(face_extractor(frame), (160, 160))
        face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
        file_name_path = 'face/user' + str(count) + '.jpg'
        cv2.imwrite(file_name_path, face)

        cv2.putText(face, str(count), (50, 50), cv2.FONT_HERSHEY_COMPLEX,1,(0,255,0),2)
        cv2.imshow('Face Cropper',face)
    else:
        print("Face not Found")
        pass

    if cv2.waitKey(1) == 13 or count == 100:
        break

cap.release()
cv2.destroyAllWindows()
print('Collecting Samples Complete!')



# Training 시작
data_path='face/'
onlyfiles=[f for f in listdir(data_path) if isfile(join(data_path,f))]

Training_data = []
Labels = []

for i, files in enumerate(onlyfiles):
    image_path = data_path + onlyfiles[i]
    images = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    Training_data.append(np.asarray(images, dtype = np.uint8))
    Labels.append(4)

Labels = np.asarray(Labels, dtype=np.int32)
Labels.dtype = np.int32

model = cv2.face.LBPHFaceRecognizer_create()
model.read('trainer/trainer.yml')

model.train(np.asarray(Training_data), np.asarray(Labels))

print("Model Training Complete!!")

model.save('trainer/trainer.yml')



