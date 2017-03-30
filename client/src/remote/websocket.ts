import { injectable, inject } from "inversify"
import { TYPES } from "../base/types"
import { ILogger } from "../utils/logging"
import { Action } from "../base/intent/actions"
import { IViewerOptions } from "../base/view/options"
import { IDiagramServer, ActionMessage, isActionMessage } from "./diagram-server"

@injectable()
export class WebSocketDiagramServer implements IDiagramServer {

    @inject(TYPES.ILogger) protected logger: ILogger
    @inject(TYPES.IViewerOptions) protected viewOptions: IViewerOptions

    protected webSocket?: WebSocket
    protected readonly actionListeners: ((a: Action) => void)[] = []

    protected get clientId(): string {
        return this.viewOptions.baseDiv
    }

    listen(webSocket: WebSocket): void {
        webSocket.addEventListener('message', event => {
            this.messageReceived(event.data)
        })
        webSocket.addEventListener('error', event => {
            this.logger.error(this, 'error event received', event)
        })
        this.webSocket = webSocket
    }

    disconnect() {
        if (this.webSocket) {
            this.webSocket.close()
            this.webSocket = undefined
        }
    }

    sendAction(action: Action): void {
        if (this.webSocket) {
            const message: ActionMessage = {
                clientId: this.clientId,
                action: action
            }
            this.logger.log(this, 'sending', action)
            this.webSocket.send(JSON.stringify(message))
        } else {
            throw new Error('WebSocket is not connected')
        }
    }

    onAction(listener: (Action) => void): void {
        this.actionListeners.push(listener)
    }

    protected messageReceived(data: any): void {
        const object = typeof(data) == 'string' ? JSON.parse(data) : data
        if (isActionMessage(object) && object.action) {
            if (!object.clientId || object.clientId == this.clientId) {
                this.logger.log(this, 'receiving', object.action.kind)
                for (let listener of this.actionListeners) {
                    listener(object.action)
                }
            }
        } else {
            this.logger.error(this, 'received data is not an action message', object)
        }
    }
}
