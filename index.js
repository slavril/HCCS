

import express from 'express'
import http from "http"
var app = express();
const server = http.createServer(app);

import { SocketService } from './app/service/Socket.service.js'

server.listen(3000, () => {
  console.log('Server đang chay tren cong 3000');
  const socketService = new SocketService()
  socketService.start(server)
});