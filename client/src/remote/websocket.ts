import "reflect-metadata"
import WebSocket = require("reconnecting-websocket")
import { injectable, inject } from "inversify"
import { TYPES } from "../base/types"
import { ILogger } from "../utils/logging"
import { Action, isAction } from "../base/intent/actions"
import { IDiagramServer } from "./diagram-server"

@injectable()
export class WebSocketDiagramServer implements IDiagramServer {

    @inject(TYPES.ILogger) protected logger: ILogger

    protected webSocket?: WebSocket
    protected filter?: (Action) => boolean
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
                this.logger.error(this, 'error event received', event)
                reject(event)
            })
            socket.addEventListener('close', event => {
                if (event.code !== 1000) {
                    this.logger.error(this, 'error during websocket reconnect', event)
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

    onAction(listener: (Action) => void): void {
        this.actionListeners.push(listener)
    }

    setFilter(filter: (Action) => boolean): void {
        this.filter = filter
    }

    protected messageReceived(data: any): void {
        const object = typeof(data) == 'string' ? JSON.parse(data) : data
        if (isAction(object)) {
            if (this.filter === undefined || this.filter(object)) {
                for (let listener of this.actionListeners) {
                    listener(object)
                }
            }
        } else {
            this.logger.error(this, 'received data is not an action', object)
        }
    }
}
