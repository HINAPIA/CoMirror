# facenet을 이용해 데이터셋 내 각 얼굴에 대한 얼굴 임베딩 계산
from numpy import load
from numpy import expand_dims
from numpy import asarray
from numpy import savez_compressed
from keras.models import load_model
import h5py
# 하나의 얼굴의 얼굴 임베딩 얻기
def get_embedding(model, face_pixels):
	# 픽셀 값의 척도
      #  face_pixels = face_pixels.reshape(1, 160*160)
        face_pixels = face_pixels.astype('int32')
        # 채널 간 픽셀값 표준화(전역에 걸쳐)
        print(face_pixels.shape)
        mean, std = face_pixels.mean(), face_pixels.std()
        face_pixels = (face_pixels - mean) / std
        # 얼굴을 하나의 샘플로 변환

        
        samples = expand_dims(face_pixels, axis=0)
        # 임베딩을 갖기 위한 예측 생성
        yhat = model.predict(samples)        
        return yhat[0]

# 얼굴 데이터셋 불러오기
data = load('trainface.npz')
trainX, trainy= data['arr_0'], data['arr_1']
print('불러오기: ', trainX.shape, trainy.shape)
# facenet 모델 불러오기
#smodel = load_model('facenet_keras.h5')
#h5 = h5py.File('./facenet_keras.h5', "r")

model = load_model('facenet_keras.h5')
print('모델 불러오기')
# 훈련 셋에서 각 얼굴을 임베딩으로 변환하기
newTrainX = list()
for face_pixels in trainX:
    embedding = get_embedding(model, face_pixels)
    newTrainX.append(embedding)
newTrainX = asarray(newTrainX)
print(newTrainX.shape)

# 배열을 하나의 압축 포맷 파일로 저장
savez_compressed('trainfaces-embeddings.npz', newTrainX, trainy)