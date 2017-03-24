import "reflect-metadata"
import WebSocket = require("reconnecting-websocket")
import {injectable, inject} from "inversify"
import { TYPES, Action, isAction } from "../base"
import { Logger } from "../utils"
import { DiagramServer } from "./diagram-server"

@injectable()
export class WebSocketDiagramServer implements DiagramServer {

    @inject(TYPES.Logger) protected logger: Logger

    protected webSocket?: WebSocket
    protected readonly actionListeners: ((Action: any) => void)[] = []

    connect(url: string, options?: any): Promise<WebSocket> {
        return new Promise<WebSocket>((resolve, reject) => {
            const socket = this.createWebSocket(url, options)
            socket.addEventListener('open', event => {
                resolve(socket)
            })
            socket.addEventListener('message', event => {
                this.messageReceived(event.data)
            })
            socket.addEventListener('error', event => {
                this.logger.error('WebSocketDiagramServer: ', event)
                reject(event)
            })
            socket.addEventListener('close', event => {
                if (event.code !== 1000) {
                    this.logger.error('WebSocketDiagramServer: error during websocket reconnect', event)
                }
            })
        })
    }

    protected createWebSocket(url: string, options?: any): WebSocket {
        if (!options) {
            options = {
                maxReconnectionDelay: 10000,
                minReconnectionDelay: 1000,
                reconnectionDelayGrowFactor: 1.3,
                connectionTimeout: 4000,
                maxRetries: Infinity,
                debug: false
            }
        }
        const webSocket = new WebSocket(url, undefined, options)
        this.webSocket = webSocket
        return webSocket
    }

    disconnect() {
        if (this.webSocket) {
            this.webSocket.close()
            this.webSocket = undefined
        }
    }

    sendAction(action: Action): void {
        if (this.webSocket) {
            const data = JSON.stringify(action)
            this.webSocket.send(data)
        } else {
            throw new Error('WebSocket is not connected')
        }
    }

    onAction(listener: (Action: any) => void): void {
        this.actionListeners.push(listener)
    }

    protected messageReceived(data: any): void {
        const object = typeof(data) == 'string' ? JSON.parse(data) : data
        if (isAction(object)) {
            for (let listener of this.actionListeners) {
                listener(object)
            }
        } else {
            this.logger.error('WebSocketDiagramServer: received data is not an action', object)
        }
    }
}
