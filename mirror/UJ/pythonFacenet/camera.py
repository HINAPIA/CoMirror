# mtcnn으로 얼굴을 감지하는 함수
from PIL import Image
from numpy import asarray
from mtcnn.mtcnn import MTCNN
import os
import PIL
# 주어진 사진에서 하나의 얼굴 추출
def extract_face(foldername , name):

    required_size=(160, 160)
    path = os.path.abspath(foldername) # 폴더 경로
    print(path)
    os.chdir(path) # 해당 폴더로 이동
    files = os.listdir(path) # 해당 폴더에 있는 파일 이름을 리스트 형태로 받음
    count = 0
    
    for file in files:
        count = count +1
        # 파일에서 이미지 불러오기
        image = PIL.Image.open(file)
        # RGB로 변환, 필요시
        image = image.convert('RGB')
        # 배열로 변환
        pixels = asarray(image)
        # 감지기 생성, 기본 가중치 이용
        detector = MTCNN()
        # 이미지에서 얼굴 감지
        results = detector.detect_faces(pixels)
        # 첫 번째 얼굴에서 경계 상자 추출
        x1, y1, width, height = results[0]['box']
        # 버그 수정
        x1, y1 = abs(x1), abs(y1)
        x2, y2 = x1 + width, y1 + height
        # 얼굴 추출
        face = pixels[y1:y2, x1:x2]
        # 모델 사이즈로 픽셀 재조정
        image = PIL.Image.fromarray(face)
        image = image.resize(required_size)
        image.save('../face/val/'+name+'/' +str(name) +'_' + str(14+ count)+'.jpg')
        face_array = asarray(image)
    return True

# 사진을 불러오고 얼굴 추출
#이름 폴더에 저장, 폴더 있어야함
pixels = extract_face('./data', 'UJ')