import {
    AbstractStreamMessageWriter
} from '../common';

export class WebSocketMessageWriter extends AbstractStreamMessageWriter {

    constructor(protected socket: WebSocket) {
        super();
    }

    protected send(content: string): void {
        this.socket.send(content);
    }

}
