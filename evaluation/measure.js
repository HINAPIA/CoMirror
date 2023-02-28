const writeXlsxFile = require("write-excel-file/node");
const fs = require("fs");

class Measure {
  EXP_COUNT = 1
  constructor(cnt, type) {
    this.TEST_COUNT = cnt
    this.type = type
    this.departureTime = []
    this.arrivalTime = []
  }

  HEADER_ROW = [
    {
      value: "",
      fontWeight: "bold",
    },
    {
      value: "전송 시간",
      fontWeight: "bold",
    },
    {
      value: "수신 시간",
      fontWeight: "bold",
    },
    {
      value: "걸린 시간",
      fontWeight: "bold",
    },
  ]

  DATA_ROWS = []

  DATA_ROW = []

  putDepartureTime(time) {
    this.departureTime.push(time);
    console.log("################## measure start : "+time)
  }
  putArrivalTime(time) {
    this.arrivalTime.push(time);
    console.log("################## measure end : "+time)
    console.log("################## measure !!! "+ (time - this.departureTime[this.departureTime.length-1]).toString());
  }

  startExp() {
    this.departureTime = []
    this.arrivalTime = []

    let EXP_ROW = [
      {
        value: `${this.type} EXP ${this.EXP_COUNT} `,
        fontWeight: "bold",
        
      }
    ]
    this.DATA_ROWS.push(EXP_ROW);
    
    this.EXP_COUNT++;
    
  }

  endExp() {
    this.DATA_ROW = []
    for (let i = 0; i < this.TEST_COUNT; i++) {
      this.DATA_ROW = [
        {
          // type: String,
          // value: this.type
        },
        {
          type: String,
          width: 40,
          value: `${this.departureTime[i].getHours()}:${this.departureTime[i].getMinutes()}:${this.departureTime[i].getSeconds()}.${this.departureTime[i].getUTCMilliseconds()}`
        },
        {
          type: String,
          width: 40,
          value: `${this.arrivalTime[i].getHours()}:${this.arrivalTime[i].getMinutes()}:${this.arrivalTime[i].getSeconds()}.${this.arrivalTime[i].getUTCMilliseconds()}`
        },
        {
          type: Number,
          width: 40,
          value: this.arrivalTime[i] - this.departureTime[i]
        }
      ]

      this.DATA_ROWS.push(this.DATA_ROW)
    }
  }

  write(text) {
    const data = [this.HEADER_ROW, ...this.DATA_ROWS]

    const makeExcel = async () => {
      if (!fs.existsSync("./excel")) {
        // excel 폴더가 존재하지 않는 경우 excel 폴더를 생성한다.
        fs.mkdirSync("./excel");
      }
      await writeXlsxFile(data, {
        filePath: "./excel/"+text+"Measure.xlsx",
      });
    };

    makeExcel();
  }

};

let loop = 100

let audioMeasure = new Measure(loop, "오디오")
let imageMeasure = new Measure(loop, "이미지")
let textMeasure = new Measure(loop, "텍스트")


// const measure = new Measure(10,"이미지")
// measure.write()
module.exports = {audioMeasure, imageMeasure, textMeasure}


