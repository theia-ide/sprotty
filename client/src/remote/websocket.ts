import { injectable } from "inversify"
import { AbstractDiagramServer } from "./diagram-server"

@injectable()
export class WebSocketDiagramServer extends AbstractDiagramServer {

    protected webSocket?: WebSocket

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

    protected sendMessage(message: string): void {
        if (this.webSocket) {
            this.webSocket.send(message)
        } else {
            throw new Error('WebSocket is not connected')
        }
    }
}
