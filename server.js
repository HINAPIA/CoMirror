const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)


/* 서버에 client가 connect 되면 불러지는 callback 함수 */
io.on('connection', (socket) => {
  console.log('connect')

  // 클라이언트가 전송한 메시지 수신 (socket.on) =========================================================

  // exit 메시지 수신 -> 통화 종료
  socket.on('exit', (roomId) => {
    console.log("exit: " + roomId)
    socket.broadcast.to(roomId).emit('exit')
  })

  // join 메시지 수신 -> 사용자가 해당 방에 들어가고자 함
  socket.on('join', (room) => {
    new Promise(() => {
      // 지금 어딘가에 방에 참가하고 있다면 방에서 나오기
      if (room.oldRoomId != null && room.oldRoomId != room.myRoomId) {
        socket.leave(String(room.oldRoomId))
        socket.broadcast.to(room.oldRoomId).emit('exit')
      }

      // 사용자가 요청한 방이 만들어졌는지 만들어졌으면 그 방에 몇명이 들어가 있는지 확인하는 변수
      const roomClients = socket.adapter.rooms.get(room.newRoomId) || { size: 0 }
      const numberOfClients = roomClients.size


      // 송신자에게만 전달 ==============================================================================

      console.log(room.oldRoomId + " : "+room.newRoomId+' : '+room.myRoomId)

      if (room.myRoomId == room.newRoomId) {
        if(numberOfClients != 0){
          socket.broadcast.to(room.oldRoomId).emit('exit')
        }
        // 방이 안만들어 져서 만들어서 방 참가(join) --> 해당 방이 자신의 mirror id여야만 가능하게 변경!
        console.log(`Creating room ${room.newRoomId} and emitting room_created socket event`)
        socket.join(room.newRoomId)
        socket.emit('room_created', room.newRoomId)
      } else if (numberOfClients == 1) {
        // 방이 있고 한명만 존재하므로 방 참가(join)
        console.log(`Joining room ${room.newRoomId} and emitting room_joined socket event`)
        socket.join(room.newRoomId)
        socket.emit('room_joined', room.newRoomId)
      } else {
        // 방에 2명이상이라 참가할 수 없다(full)
        console.log(`Can't join room ${room.newRoomId}, emitting full_room socket event`)
        socket.emit('full_room', room.newRoomId)
      }
    })
  })

  // 송신자를 제외한 동일한 방에 연결된 모든 소켓으로 전송 ===================================================

  // 사용자가 전화를 요청해서 같은 방의 다른 사용자에게 전화 요청 전달
  socket.on('start_call', (event) => {
    console.log(`Broadcasting start_call event to peers in room ${event.roomId} : id - ${event.myId}`)
    socket.broadcast.to(event.roomId).emit('start_call', event)
  })

  socket.on('absensce', (event) => {
    console.log(`Broadcasting absensce event to peers in room ${event.roomId} : id - ${event.myId}`)
    socket.broadcast.to(event.roomId).emit('absensce', event.myId)
  })

  // 사용자가 전화를 요청받고 SDP를 전달해서 같은 방의 다른 사용자에게 이를 전달
  socket.on('webrtc_offer', (event) => {
    console.log(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`)
    socket.broadcast.to(event.roomId).emit('webrtc_offer', event)
  })

  // 사용자가 다른 사용자의 SDP를 받고 자신의 SDP를 전달해서 같은 방의 다른 사용자에게 이를 전달
  socket.on('webrtc_answer', (event) => {
    console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`)
    socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp)
  })

  // 서로에게 SDP가 전달되고 나서 서로에게 P2P 통신을 위한 ICE 전달 실행 (Signaling)
  socket.on('webrtc_ice_candidate', (event) => {
    console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId} id = ${event.myId}`)
    //console.log('||| '+event.candidate)
    socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event)
  })
})

// START THE SERVER: 3000port 열기 =================================================================
const port = process.env.PORT || 3000
server.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})
