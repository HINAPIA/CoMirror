
import crop
import dataPreProcess
import numpy
import model

# 카메라로 사진 찍어서 얼굴부분만 크롭해서 저장
crop.createCropImage('user', './face/login', 20)
 # 훈련 데이터셋 불러오기
image_data_dir = 'face/login/'
trainX, trainy = dataPreProcess.load_dataset(image_data_dir)
# 배열을 단일 압축 포맷 파일로 저장
dataset_file_name = './loginface.npz'
numpy.savez_compressed(dataset_file_name, trainX, trainy)
print(trainX.shape, trainy.shape)

newTrainX, trainy = dataPreProcess.embedding(dataset_file_name)
embedding_file_name = 'login-embeddings.npz'
# 배열을 하나의 압축 포맷 파일로 저장
numpy.savez_compressed(embedding_file_name, newTrainX, trainy )
user = model.user_check(embedding_file_name)
if(user):
    print('%s님 환영 합니다.'% user)
else :
    print("등록된 사용자가 아닙니다")