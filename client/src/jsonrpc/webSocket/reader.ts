import {DataCallback} from "vscode-jsonrpc/lib/messageReader"
import {AbstractStreamMessageReader} from "../common"

export class WebSocketMessageReader extends AbstractStreamMessageReader {

    constructor(protected socket: WebSocket) {
        super();
    }

    listen(callback: DataCallback): void {
        this.socket.addEventListener('message', event => {
            this.readMessage(event.data, callback)
        });
        this.socket.addEventListener('error', event => {
            if (event instanceof ErrorEvent) {
                this.fireError(event.message);
            }
        });
        this.socket.addEventListener('close', event => {
            if (event.code !== 1000) {
                const error: Error = {
                    name: '' + event.code,
                    message: `Error during WS reconnect: code = ${event.code}, reason = ${event.reason}`
                };
                this.fireError(error);
            }
            this.fireClose();
        });
    }

}
