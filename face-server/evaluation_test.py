import csv
import os.path
import dataPreProcess
import loginPE
import numpy
from keras.models import load_model
from dataPreProcess import load_dataset
from numpy import savez_compressed
from dataPreProcess import load_dataset
from dataPreProcess import embedding
import time

embeddingModel = load_model('facenet_keras.h5')
# csv 파일 생성
def create_login_data(embeddingModel, file):
    
    sum = 0
    # 현재 파일의 디렉토리 경로. 작업 파일 기준
    curDir = os.path.dirname(os.path.realpath(__file__))
    os.chdir(curDir)
    
    # 훈련 데이터셋 불러오기
    trainX, trainy = load_dataset(os.path.join('dataPE','val'))
    # 배열을 단일 압축 포맷 파일로 저장
    savez_compressed(os.path.join('dataPE', 'files','loginface.npz'), trainX, trainy)
    print(trainX.shape, trainy.shape)

    newTrainX, trainy = embedding(embeddingModel, os.path.join('dataPE', 'files','loginface.npz'))
    # 임베딩 된 데이터 배열을 하나의 압축 포맷 파일로 저장 - 파일명 : login-embeddings.npz
    savez_compressed(os.path.join('dataPE', 'files','loginFaceEmbedding',file), newTrainX, trainy )

    # embedding_dataset = os.path.join('dataPE', 'files','login-embeddings.npz')
    # for i in range(100):
    #     sum += user_check_PE(i, embedding_dataset, "400")

    # print('****최종 정확도****: %.3f' % (sum/100.0))
    # print()

create_login_data(embeddingModel,'km-embeddings.npz')
# create_login_data(embeddingModel,'sy-embeddings.npz')
# create_login_data(embeddingModel,'cw-embeddings.npz')
# create_login_data(embeddingModel,'yj-embeddings.npz')

def make_csv(file_name, field_name, datas):
    file_path = './csv/'+file_name
    with open(file_path, 'a', newline='') as f:
        write = csv.writer(f)
        write.writerow(field_name)
        write.writerows(datas)
    f.close

# 디렉토리의 파일 불러오기 - selct 하위 폴더의 갯수
def load_dataset_select_subfolder(directory, subfolder_cnt):
    cnt = 0
    X, y = list(), list()
	# 클래스별로 폴더 열기
    directory = directory + os.path.sep
	# print('directory : ' + directory)
	# directory : face\login\
    for subdir in os.listdir(directory):
		# 경로
        path = os.path.join(directory, subdir) + os.path.sep
		# 디렉토리에 있을 수 있는 파일을 건너뛰기(디렉토리가 아닌 파일)
        if not os.path.isdir(path):
            continue
		# 하위 디렉토리의 모든 얼굴 불러오기
        faces = dataPreProcess.load_faces(path)
		# 레이블 생성
        labels = [subdir for _ in range(len(faces))]
    
		# 진행 상황 요약
		#print('>%d개의 예제를 불러왔습니다. 클래스명: %s' % (len(faces), subdir))
		# 저장
        X.extend(faces)
        y.extend(labels)
        cnt=cnt +1
        if(cnt ==subfolder_cnt ):
            break
    return numpy.asarray(X), numpy.asarray(y)	

def check_trainTime_with_people_count():
    print("***사람 명 수에 따른 훈련시간***")
    counts = [2,3,4,5,6,8,10]
    datas = []
    for i in counts:
        start = time.time()
        # 라벨링 작업
        trainX, trainy = load_dataset_select_subfolder(os.path.join('dataPE','train'), i)
        #포맷 파일로 저장
        folder_path = (os.path.join('dataPE','files')) 
        dataset_file_name = 'trainface.npz'
        numpy.savez_compressed(  folder_path +os.path.sep+ dataset_file_name, trainX, trainy)
        print(trainX.shape, trainy.shape)

        # 라벨링한 데이터를 임베딩 작업
        newTrainX, trainy = dataPreProcess.embedding(embeddingModel, folder_path+os.path.sep+dataset_file_name)
        numpy.savez_compressed(folder_path  + os.path.sep+'trainfaces-embeddings.npz', newTrainX, trainy )
        # 모델 학습
        loginPE.model_fit_PE(folder_path  + os.path.sep+ 'trainfaces-embeddings.npz')
        end = time.time()
        print(end - start)
        datas.append([i,40,end- start])
    field_name = ['훈련하는 사람 수', '훈련 장 수', '시간(s)']
    make_csv('check_trainTime_with_people_count.csv', field_name, datas)
