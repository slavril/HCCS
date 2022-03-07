import { Server } from "socket.io"
import TransactionModel from '../models/Transaction.model.js'

const socket_observe_key = {
    // receive
    connected: 'connection',
    getSocketId: 'getId',
    disconnect: 'disconnect',

    getAddNewPatient: 'addNewPatient',
    getSyncData: 'getSyncData',
    //send
    sendNewPatientCreated: 'newPatientCreated',
    sendSyncData: 'syncData',

    getAddNewPrescription: 'addNewPrescription',
    newPrescriptionCreated: 'newPrescriptionCreated'
}

export class SocketService {

    socketIo = undefined

    miners = []

    receiveSocketId = null
    maxChainLength = {
        socketId: null,
        max: 0
    }

    get minerID() {
        if (this.miners.length > 0) return this.miners[this.miners.length - 1]
        return null
    }

    /**
     * 
     * @param {String} data 
     * @param {String} socketId
     */
    sendData = (data, command, socketId = null) => {
        if (socketId) {
            this.socketIo.to(socketId).emit(command, data);
        }
        else {
            this.socketIo.emit(command, data);
        }
    }

    start = (server) => {

        this.socketIo = new Server(server, {
            cors: {
                origin: '*',
                allowedHeaders: ["hc-header"],
                credentials: true
            }
        });

        this.socketIo.on(socket_observe_key.connected, (socket) => {
            console.log("New client connected " + socket.id);
            socket.emit(socket_observe_key.getSocketId, socket.id);

            socket.on(socket_observe_key.disconnect, () => {
                console.log("Client disconnected");

                const index = this.miners.findIndex(e => e == socket.id)
                if (index >= 0) {
                    this.miners.splice(index, 1)
                }
            });

            // send miner
            socket.on(socket_observe_key.getAddNewPatient, (json) => {
                console.log('someone want to add new patient');
                if (json.data) {
                    console.log('sent to miner');
                    socket.to(this.minerID).emit(socket_observe_key.getAddNewPatient, json)
                }
            })

            // miner forward to all
            socket.on(socket_observe_key.sendNewPatientCreated, data => {
                socket.broadcast.emit(socket_observe_key.sendNewPatientCreated, data)
            })

            socket.on(socket_observe_key.getSyncData, () => {
                console.log('Someone need sync the chains');
                socket.broadcast.emit('getMaxChain', socket.id)
                this.receiveSocketId = socket.id

                setTimeout(() => {
                    if (this.maxChainLength.socketId != null) {
                        socket.to(this.maxChainLength.socketId).emit('getChains', this.receiveSocketId)
                        this.maxChainLength = {
                            max: 0,
                            socketId: null
                        }
                    }
                    else {
                        console.log('Miner send the chain', this.minerID, this.receiveSocketId);
                        socket.to(this.minerID).emit('getChains', this.receiveSocketId)
                    }
                }, 3000);
            })

            socket.on('miner', (data) => {
                console.log('miner sign in', data);
                if (!this.miners.find(e => e == data)) {
                    console.log('miner assigned', data);
                    this.miners.push(data)
                }
            })

            // get sync from miner
            socket.on(socket_observe_key.sendSyncData, (data) => {
                console.log('Get sync from node', data, socket.id);
                if (data.socketId) {
                    socket.to(data.socketId).emit(socket_observe_key.sendSyncData, data)
                }
                else {
                    socket.broadcast.emit(socket_observe_key.sendSyncData, data)
                }
            })

            socket.on('getMaxChain', data => {
                console.log('max chain', socket.id, data);
                console.log('max chain', this.maxChainLength.max);
                if (data && data.data && data.data.max > this.maxChainLength.max) {
                    this.maxChainLength.socketId = socket.id
                    this.maxChainLength.max = data.data.max
                }
            })

            // send miner
            socket.on(socket_observe_key.getAddNewPrescription, json => {
                socket.to(this.minerID).emit(socket_observe_key.getAddNewPrescription, json)
            })

            // miner forward to all
            socket.on(socket_observe_key.newPrescriptionCreated, (json) => {
                socket.broadcast.emit(socket_observe_key.newPrescriptionCreated, json)
            })

            // smartcontract need process
            socket.on('smc', (json) => {
                socket.to(this.minerID).emit('smc', json)
            })

            socket.on('smc_return', json => {
                const transaction = TransactionModel.initFromJson(json)
                if (transaction.socketId) {
                    socket.to(transaction.socketId).emit('smc_return', json)
                }
                else {
                    socket.broadcast.emit('smc_return', json)
                }

            })

            socket.on('newNodeAdded', json => {
                socket.broadcast.emit('newNodeAdded', json)
            })

        });
    }

}