import { TimeUtil } from '../utils/Time.util.js'

export default class Transaction {

    socketId = null
    timestamp = null
    /**
     * @type {Object} data
     */
    data = null

    constructor() {
        this.timestamp = TimeUtil.currentUTCTimestamp()
    }

    /**
     * 
     * @param {Object} jsonString 
     * @returns {Transaction}
     */
    static initFromJson = (json) => {
        let transaction = new Transaction()
        transaction.socketId = json.socketId
        transaction.timestamp = json.timestamp
        transaction.data = json.data

        return transaction
    }

    toJsonString = () => {
        const json = {
            socketId: this.socketId,
            timestamp: this.timestamp,
            data: data
        }

        return JSON.stringify(json)
    }

    static init = (socketId, data) => {
        let transaction = new Transaction()
        transaction.socketId = socketId
        transaction.timestamp = TimeUtil.currentUTCTimestamp()
        transaction.data = data
        return transaction
    }

}