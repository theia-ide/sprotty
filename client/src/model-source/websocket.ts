/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";
import { DiagramServer, ActionMessage } from "./diagram-server";

/**
 * An external ModelSource that connects to the model provider using a
 * websocket.
 */
@injectable()
export class WebSocketDiagramServer extends DiagramServer {

    protected webSocket?: WebSocket;

    listen(webSocket: WebSocket): void {
        webSocket.addEventListener('message', event => {
            this.messageReceived(event.data);
        });
        webSocket.addEventListener('error', event => {
            this.logger.error(this, 'error event received', event);
        });
        this.webSocket = webSocket;
    }

    disconnect() {
        if (this.webSocket) {
            this.webSocket.close();
            this.webSocket = undefined;
        }
    }

    protected sendMessage(message: ActionMessage): void {
        if (this.webSocket) {
            this.webSocket.send(JSON.stringify(message));
        } else {
            throw new Error('WebSocket is not connected');
        }
    }
}
