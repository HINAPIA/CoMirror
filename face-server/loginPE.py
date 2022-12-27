from model import model_fit
from asyncio.windows_events import NULL
from model import user_check
from numpy import savez_compressed
from dataPreProcess import load_dataset
from dataPreProcess import embedding
import os.path 
import os
from keras.models import load_model
import numpy
from numpy import load
from numpy import expand_dims
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import Normalizer
from sklearn.svm import SVC
from random import choice
import joblib
import os
import os.path
from sklearn.metrics import accuracy_score

curDir = os.path.dirname(os.path.realpath(__file__))
os.chdir(curDir)
embeddingModel = load_model('facenet_keras.h5')

  
# 얼굴 학습
def model_fit_PE(embedding_file_name, mirror_id):

    # 얼굴 임베딩 불러오기
    data = load(embedding_file_name)
    trainX_faces =data['arr_0']
    trainX, trainy = data['arr_0'], data['arr_1']
    # 입력 벡터 일반화
    in_encoder = Normalizer(norm='l2')
    trainX = in_encoder.transform(trainX)
    # 목표 레이블 암호화
    out_encoder = LabelEncoder()
    out_encoder.fit(trainy)
    trainy = out_encoder.transform(trainy)
    # 모델 적합

    model_file = os.path.join('dataPE', mirror_id,'files','model.pkl')
    #만들어진 모델이 없다면 새롭게 만든다
    model = SVC(kernel='linear', probability=True)
    model.fit(trainX, trainy)
    #모델 저장
    joblib.dump(model, model_file)

    # 추측
    yhat_train = model.predict(trainX)
    # 정확도 점수
    score_train = accuracy_score(trainy, yhat_train)
    # 요약
    print('정확도: 훈련=%.3f' % (score_train*100))

    # 테스트 데이터셋에서 임의의 예제에 대한 테스트 모델
    for i in range(20):
        selection = choice([i for i in range(trainX.shape[0])])
        random_face_pixels = trainX_faces[selection]
        random_face_emb = trainX[selection]
        random_face_class = trainy[selection]
        random_face_name = out_encoder.inverse_transform([random_face_class])
        # 얼굴 예측
        samples = expand_dims(random_face_emb, axis=0)
        yhat_class = model.predict(samples)
        yhat_prob = model.predict_proba(samples)
        # 이름 얻기
        class_index = yhat_class[0]
        class_probability = yhat_prob[0,class_index] * 100
        predict_names = out_encoder.inverse_transform(yhat_class)
        print('예상: %s (%.3f)' % (predict_names[0], class_probability))
        print('실제값: %s' % random_face_name[0])

def reTrain_PE(embeddingModel, mirror_id):
    mirror_id = str(mirror_id)
    # 라벨링 작업
    trainX, trainy = load_dataset(os.path.join('dataPE',mirror_id,'train'))
    # 단일 압축 포맷 파일로 저장
    folder_path = (os.path.join('dataPE',mirror_id,'files')) 
    dataset_file_name = 'trainface.npz'
    numpy.savez_compressed(  folder_path +os.path.sep+ dataset_file_name, trainX, trainy)
    print(trainX.shape, trainy.shape)

    # 라벨링한 데이터를 임베딩 작업
    newTrainX, trainy = embedding(embeddingModel, folder_path+os.path.sep+dataset_file_name)
    numpy.savez_compressed(folder_path  + os.path.sep+'trainfaces-embeddings.npz', newTrainX, trainy )
    # 모델 학습
    model_fit_PE(folder_path  + os.path.sep+ 'trainfaces-embeddings.npz', mirror_id)
    return True

def login_PE(embeddingModel, mirror_id):
    
    # 현재 파일의 디렉토리 경로. 작업 파일 기준
    curDir = os.path.dirname(os.path.realpath(__file__))
    os.chdir(curDir)
    
    # 훈련 데이터셋 불러오기
    trainX, trainy = load_dataset(os.path.join('dataPE',mirror_id,'val'))
    # 배열을 단일 압축 포맷 파일로 저장
    savez_compressed(os.path.join('dataPE',mirror_id, 'files','loginface.npz'), trainX, trainy)
    print(trainX.shape, trainy.shape)

    newTrainX, trainy = embedding(embeddingModel, os.path.join('dataPE',mirror_id, 'files','loginface.npz'))
    # 임베딩 된 데이터 배열을 하나의 압축 포맷 파일로 저장 - 파일명 : login-embeddings.npz
    savez_compressed(os.path.join('dataPE',mirror_id, 'files','login-embeddings.npz'), newTrainX, trainy )

    embedding_dataset = os.path.join('dataPE',mirror_id, 'files','login-embeddings.npz')
    user_check_PE(embedding_dataset, "400")

# 얼굴 인식
def user_check_PE(embedding_dataset, mirror_id):
    # pre_embedding_file= load(os.path.join('dataPE', mirror_id, 'files','trainfaces-embeddings.npz'))
    # label_y = pre_embedding_file['arr_1']
    # 얼굴 임베딩 파일 불러오기
    test_data = load(embedding_dataset)
    testX, testY = test_data['arr_0'],  test_data['arr_1']
    # 입력 벡터 일반화
    in_encoder = Normalizer(norm='l2')
    testX = in_encoder.transform(testX)
    # 목표 레이블 암호화
    out_encoder = LabelEncoder()
    out_encoder.fit(testY)
    print('데이터셋:  테스트 %d개' % (testX.shape[0]))
    #모델 적합
    #모델 파일은 새로운 유저가 회원가입 시 갱신되며 만들어진다
    model_file = os.path.join('dataPE',mirror_id,'files','model.pkl')
    if not os.path.isfile(model_file):
        print('모델이 없습니다')
        return

    model = joblib.load(model_file)
    yhat_test = model.predict(testX)
    
    predict_names = out_encoder.inverse_transform(yhat_test)
    score_test = accuracy_score(testY, predict_names)
    # 정확도 값
    yhat_prob = model.predict_proba(testX)
    class_probability = yhat_prob[0] * 100
    #print('예상: %s (%.3f)' % (predict_names[0], class_probability))

    
    #test 데이터 갯수만큼 반복
    for i in range(testX.shape[0]):
        print('실제 값: %s,  예측 값= %s' % (testY[i], predict_names[i]))
    print('정확도: 테스트=%.3f' % (score_test*100))



#reTrain_PE(embeddingModel, 400)
#login_PE(embeddingModel, "400")
mirror_id = str(400)
embedding_dataset = os.path.join('dataPE',mirror_id, 'files','login-embeddings.npz')
user_check_PE(embedding_dataset, "400")