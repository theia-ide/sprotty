const WebSocket = require('reconnecting-websocket')

import "reflect-metadata"
import {injectable, inject} from "inversify"
import { TYPES, Action, IActionDispatcher, UpdateModelAction } from "../base"
import {ConsoleLogger} from "../utils"
import {WebSocketMessageReader, WebSocketMessageWriter} from "./webSocket"
import {
    CancellationToken,
    MessageConnection,
    NotificationType1,
    RequestType1,
    createMessageConnection
} from "vscode-jsonrpc"

@injectable()
export class DiagramServer {

    @inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher

    protected webSocket?: WebSocket
    protected connection?: MessageConnection

    connectWebSocket(url: string, options?: any): Promise<MessageConnection> {
        return new Promise<MessageConnection>((resolve, reject) => {
            const socket = this.createWebSocket(url, options)
            socket.addEventListener('open', event => {
                const logger = new ConsoleLogger()
                const messageReader = new WebSocketMessageReader(socket)
                const messageWriter = new WebSocketMessageWriter(socket)
                const connection = createMessageConnection(messageReader, messageWriter, logger)
                this.registerServerMessages(connection)
                connection.onClose(() => connection.dispose())
                connection.listen()
                this.connection = connection
                resolve(connection)
            })
            socket.addEventListener('error', reject)
        });
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

    protected registerServerMessages(connection: MessageConnection): void {
        connection.onNotification('modelChanged', (action: UpdateModelAction) => {
            this.actionDispatcher.dispatch(action)
        })
    }

    disconnect() {
        if (this.webSocket) {
            this.webSocket.close()
            this.webSocket = undefined
        }
        if (this.connection) {
            this.connection.dispose()
            this.connection = undefined
        }
    }

    request(action: Action, token?: CancellationToken): Thenable<Action[]> {
        if (!this.connection)
            throw new Error("The diagram server is not connected.")
        token = token || CancellationToken.None
        return this.connection.sendRequest(action.kind, action, token)
    }

    notify(action: Action): void {
        if (!this.connection)
            throw new Error("The diagram server is not connected.")
        return this.connection.sendNotification(action.kind, action)
    }
}
