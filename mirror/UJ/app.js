//하기전에 이 파일 있는곳에 git clone https://github.com/justadudewhohacks/face-api.js.git
// 그리고 npm i 
const faceapi = require("face-api.js")  
const canvas = require("canvas")  
const Jimp = require("jimp")
const fs = require("fs")  
const path = require("path")
const { createContext } = require("vm")


// mokey pathing the faceapi canvas
const { Canvas, Image, ImageData } = canvas  
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
const faceDetectionNet = faceapi.nets.ssdMobilenetv1


// SsdMobilenetv1Options
const minConfidence = 0.5

// TinyFaceDetectorOptions
const inputSize = 408  
const scoreThreshold = 0.5

// MtcnnOptions
const minFaceSize = 50  
const scaleFactor = 0.8
function getFaceDetectorOptions(net) {  
    return net === faceapi.nets.ssdMobilenetv1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : (net === faceapi.nets.tinyFaceDetector
            ? new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
            : new faceapi.MtcnnOptions({ minFaceSize, scaleFactor })
        )
}

const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet)

// simple utils to save files
const baseDir = path.resolve(__dirname, './out')  
function saveFile(fileName, buf) {  
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir)
    }
    // this is ok for prototyping but using sync methods
    // is bad practice in NodeJS
    fs.writeFileSync(path.resolve(baseDir, fileName), buf)
  }
  
async function crop(detection, imgUrl){
  const image = await Jimp.read(imgUrl)
  x = detection.box.topLeft.x
  y = detection.box.topLeft.y
  width = detection.box.width
  height = detection.box.height
  image.crop(x,y,width, height).write('./out/5.jpg')

}
async function run() {

    
    // load weights
    await faceDetectionNet.loadFromDisk('./face-api.js/weights')
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./face-api.js/weights')

    // load the image
    let imgurl = 'public/models/5.jpg'
    const image = await canvas.loadImage(imgurl)
    await faceapi.detectSingleFace(image, faceDetectionOptions)
      .then(detection =>{    
        crop(detection,imgurl)
      })
    
   
      
    
  //  saveFile('faceLandmarkDetection.jpg', out.toBuffer('image/jpeg'))
    
    //   const out = faceapi.createCanvasFromMedia(image)
    //   faceapi.draw.drawDetections(out, detection)
    //  
    // })
    // detect the faces with landmarks
   // const detection = await faceapi.detectSingleFace(img, faceDetectionOptions)
   // left = detection.box.left

   // console.log('topRight :' + topRight.x +':' + topRight.y)
  
   
    //  constructor(score: number, relativeBox: Rect, imageDims: IDimensions);
   // forSize(width: number, height: number): FaceDetection;
    // create a new canvas and draw the detection and landmarks
    
    //faceapi.drawLandmarks(out, results.map(res => res.landmarks), { drawLines: true, color: 'red' })

    // save the new canvas as image
  
    console.log('done, saved results to out/faceLandmarkDetection.jpg')
}

run()  