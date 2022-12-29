const writeXlsxFile = require("write-excel-file/node");
const fs = require("fs");

// calculator-base.js

class Mesure {
    
    constructor(cnt,type){
        this.TEST_COUNT = cnt
        this.type = type
        this.departure_time = []
        this.arrival_time = []
    }

    putDepartureTime(time) {
        departure_time.push(time);
    }
    putArrivalTime(time) {
        arrival_time.push(time);
    }

    write() {

        const HEADER_ROW = [
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
          ];
          
          let DATA_ROWS = []
          for (let i = 0; i< this.TEST_COUNT; i++){
            let  DATA_ROW = [
                {
                    type:String,
                    value:this.type
                },
                {
                    type:Date,
                    value: new Date(),
                    format:"hh:mm:ss"
                    // value:this.departure_time[i]
                },
                {
                    type:Date,
                    value: new Date(),
                    format:"hh:mm:ss"
                    // type:Date,
                    // value:this.arrival_time[i]

                },
                {
                    type:Number,
                    value:1
                    // value:this.arrival_time[i] - this.departure_time[i]
                }
            ]

            DATA_ROWS.push(DATA_ROW)
          }
         
         const data = [HEADER_ROW, ...DATA_ROWS]

         const makeExcel = async () => {
            if (!fs.existsSync("./excel")) {
              // excel 폴더가 존재하지 않는 경우 excel 폴더를 생성한다.
              fs.mkdirSync("./excel");
            }
            await writeXlsxFile(data, {
              filePath: "./excel/member.xlsx",
            });
          };
          
          makeExcel();
    }
    
};

// const mesure = new Mesuare(10,"이미지")
// mesure.write()
module.exports = Mesure


