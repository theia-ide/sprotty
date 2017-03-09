const WebSocket = require('reconnecting-websocket');

import {createMessageConnection, MessageConnection} from 'vscode-jsonrpc';
import {DiagramServer} from "../protocol";
import {ConsoleLogger} from '../common';
import {WebSocketMessageReader} from './reader';
import {WebSocketMessageWriter} from './writer';

export function connectDiagramServer(url: string): Promise<DiagramServer> {
    return new Promise<DiagramServer>((resolve, reject) => {
        createWebSocketConnection(url).then((connection: MessageConnection) => {
            connection.listen();
            resolve(new DiagramServer(connection));
        }).catch(reject);
    });
}

export function createWebSocketConnection(url: string): Promise<MessageConnection> {
    const socket = createWebSocket(url);
    return new Promise<MessageConnection>((resolve, reject) => {
        socket.addEventListener('open', event => {
            const logger = new ConsoleLogger();
            const messageReader = new WebSocketMessageReader(socket);
            const messageWriter = new WebSocketMessageWriter(socket);
            const connection = createMessageConnection(messageReader, messageWriter, logger);
            connection.onClose(() => connection.dispose());
            resolve(connection);
        })
        socket.addEventListener('error', reject)
    });
}

function createWebSocket(url: string): WebSocket {
    const options = {
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1.3,
        connectionTimeout: 4000,
        maxRetries: Infinity,
        debug: false
    }
    return new WebSocket(url, undefined, options);
}
