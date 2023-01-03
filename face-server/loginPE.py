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
import random

curDir = os.path.dirname(os.path.realpath(__file__))
os.chdir(curDir)
embeddingModel = load_model('facenet_keras.h5')

  
# 얼굴 학습
def model_fit_PE(embedding_file_name):

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

    model_file = os.path.join('dataPE','files','model.pkl')
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
    for i in range(40):
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
    model_fit_PE(folder_path  + os.path.sep+ 'trainfaces-embeddings.npz')


def login_PE(embeddingModel, mirror_id):
    
    sum = 0
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
    for i in range(100):
        sum += user_check_PE( embedding_dataset, "400")

    print('****최종 정확도****: %.3f' % (sum/100.0))
    print()


# 얼굴 인식
def user_check_PE( embedding_dataset, modelFile,valid_count):
    sum_class_probability = 0
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
    print(modelFile)
    if not os.path.isfile(modelFile):
        print('모델이 없습니다')
        return

    model = joblib.load(modelFile)
    #test 데이터 갯수만큼 반복

    num = list(range(0,testX.shape[0]-1)) 
    out = random.sample(num, valid_count)
    yhat_test = model.predict(testX[out])
    
    #predict_names = out_encoder.inverse_transform(yhat_test)
    #score_test = accuracy_score(testY, predict_names)
    # 정확도 값
    yhat_prob = model.predict_proba(testX[out])
    class_probability = yhat_prob* 100
    print(class_probability)
    sum_class_probability += class_probability
    return class_probability
    #print('실제 값: %s,  예측 값= %s, 분류 확률 = (%.3f)' % (testY[i], predict_names[i],class_probability[i].max()))
    #print('정확도:  분류율 mean = %.3f' % sum_class_probability/testX.shape[0])




#reTrain_PE(embeddingModel, 400)
#user_check_PE(embedding_dataset, "400")

# 얼굴인식 모델 훈련 때 사용한 사진의 수, 데이터 측정을 반복 횟수, 몇 장을 랜덤으로 뽑을 건지 입력 받아서
# 인식률과 분류율을 콘솔로 띄우고 파일로 저장하는 함수
def class_probability_evaluation(train_cnt, repeat_cnt, select_cnt, mirror_id):
    datas=[]
    mirror_id = str(mirror_id)
    #분류율
    class_prob_sum = 0
    #인식률
    recognition_prob_sum = 0
    #사용할 testset
    embedding_dataset = os.path.join('dataPE',mirror_id, 'files','login-embeddings.npz')
    test_data = load(embedding_dataset)
    testX, testY = test_data['arr_0'],  test_data['arr_1']
    # 입력 벡터 일반화
    in_encoder = Normalizer(norm='l2')
    testX = in_encoder.transform(testX)
    # 목표 레이블 암호화
    out_encoder = LabelEncoder()
    out_encoder.fit(testY)
    #사용할 얼굴인식 모델
    model_folder = os.path.join("dataPE",mirror_id,"files","model")
    model_name = "model"+str(train_cnt)+".pkl"
    model = joblib.load(os.path.join(model_folder,model_name))
    
    #측정 시작    
    for repeat_index in range(repeat_cnt):
        # 중복 없이 select_cnt 값만큼 인덱스 뽑기
        selection = random.sample(range(0,testX.shape[0]-1),select_cnt)
        #뽑은 데이터 predict
        yhat_test=model.predict(testX[selection])
        predict_names=out_encoder.inverse_transform(yhat_test)
        #인식률
        score_test=accuracy_score(testY[selection], predict_names) 
        score_probability=score_test*100
        # 분류율
        yhat_prob=list(map(max,model.predict_proba(testX[selection])))
        class_probability=yhat_prob*100
        class_probability_mean = sum(class_probability)/len(class_probability)*100
        # end of select_cnt roof
        print('[%d] train_cnt : %d |  select_cnt : %d | recognition_prob =%.3f , class_prob = %.3f' % (repeat_index, train_cnt,select_cnt, score_probability, class_probability_mean))
        class_prob_sum += class_probability_mean
        #인식률
        recognition_prob_sum += score_probability
        # csv에 넣을 row data 생성
        data = [train_cnt, select_cnt, repeat_index, score_probability, class_probability_mean]
        datas.append(data)
    #측정 끝
    print('##### 최종 recognition_prob_mean : %.3f | class_prob_mean : %.3f' %(recognition_prob_sum/repeat_cnt, class_prob_sum/repeat_cnt))
    data = ['','','',recognition_prob_sum/repeat_cnt, class_prob_sum/repeat_cnt]
    datas.append(data)
    field_name = ['회원가입 사진 장 수', '로그인 사진 장 수', '로그인 회차', '인식률', '분류율']
    #evaluation_test.make_csv('face_recog.csv', field_name, datas)





mirror_id = str(400)
#embedding_dataset = os.path.join('dataPE',mirror_id, 'files','login-embeddings.npz')
#login_PE(embeddingModel, "400")
