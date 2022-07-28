import crop
from model import model_fit
import numpy
import dataPreProcess 


def createAccoount(username):

    # 카메라로 사진 찍어서 얼굴부분만 크롭해서 저장
    crop.createCropImage(username, './face/train', 40)
    # 훈련 데이터셋 불러오기
    image_data_dir= 'face/train/'
    trainX, trainy = dataPreProcess.load_dataset(image_data_dir)
    # 배열을 단일 압축 포맷 파일로 저장
    dataset_file_name = './trainface.npz'
    numpy.savez_compressed(dataset_file_name, trainX, trainy)
    print(trainX.shape, trainy.shape)

    newTrainX, trainy = dataPreProcess.embedding(dataset_file_name)
    embedding_file_name = 'trainfaces-embeddings.npz'
    # 배열을 하나의 압축 포맷 파일로 저장
    numpy.savez_compressed(embedding_file_name, newTrainX, trainy )
    model_fit(embedding_file_name)

createAccoount('kSY')