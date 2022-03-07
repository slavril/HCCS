import express from 'express'
import http from "http"
var app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000

import { SocketService } from './app/service/Socket.service.js'

server.listen(port, () => {
  console.log('Server đang chay tren cong 3000');
  const socketService = new SocketService()
  socketService.start(server)
});