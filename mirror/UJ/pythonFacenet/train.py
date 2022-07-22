from os import listdir
from os.path import isdir
from PIL import Image
from matplotlib import pyplot
from numpy import savez_compressed
from numpy import asarray
from mtcnn.mtcnn import MTCNN


# 디렉토리 안의 모든 이미지를 불러오고 이미지에서 얼굴 추출
def load_faces(directory):
    faces = list()
	# 파일 열거
    for filename in listdir(directory):
        # 경로
        path = directory + filename
        # 얼굴 추출
        #face = extract_face(path)
        image = Image.open(path)
        face_array = asarray(image)
        # 저장
        faces.append(face_array)
    return faces

# 이미지를 포함하는 각 클래스에 대해 하나의 하위 디렉토리가 포함된 데이터셋을 불러오기
def load_dataset(directory):
	X, y = list(), list()
	# 클래스별로 폴더 열거
	for subdir in listdir(directory):
		# 경로
		path = directory + subdir + '/'
		# 디렉토리에 있을 수 있는 파일을 건너뛰기(디렉토리가 아닌 파일)
		if not isdir(path):
			continue
		# 하위 디렉토리의 모든 얼굴 불러오기
		faces = load_faces(path)
		# 레이블 생성
		labels = [subdir for _ in range(len(faces))]
    
		# 진행 상황 요약
		print('>%d개의 예제를 불러왔습니다. 클래스명: %s' % (len(faces), subdir))
		# 저장
		X.extend(faces)
		y.extend(labels)
	return asarray(X), asarray(y)

# 훈련 데이터셋 불러오기
trainX, trainy = load_dataset('./face/train/')
print(trainX.shape, trainy.shape)
# 테스트 데이터셋 불러오기
testX, testy = load_dataset('./face/val/')
print(testX.shape, testy.shape)
# 배열을 단일 압축 포맷 파일로 저장
savez_compressed('face.npz', trainX, trainy, testX, testy)