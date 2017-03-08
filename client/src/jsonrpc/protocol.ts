import {
    CancellationToken, Disposable, GenericNotificationHandler, MessageConnection, NotificationType1, RequestType1
} from 'vscode-jsonrpc';
import {IDiagramServer, GetDiagramParams, SelectionParams, GModelRootSchema} from "../base/model";

export class DiagramServer implements IDiagramServer {

    protected connection: MessageConnection;

    constructor(connection: MessageConnection) {
        this.connection = connection;
    }

    dispose() {
    }

    getDiagram(params: GetDiagramParams, token?: CancellationToken): Thenable<GModelRootSchema> {
        token = token || CancellationToken.None;
        return this.connection.sendRequest(GetDiagramRequest.type, params, token);
    }

    elementSelected(params: SelectionParams): void {
        return this.connection.sendNotification(ElementSelectedNotification.type, params);
    }

}

export namespace DiagramServer {
    export function connect(connection: MessageConnection, target: IDiagramServer): void {
        connection.onRequest("getDiagram", 
            (params, cancelToken) => {
                return target.getDiagram(params, cancelToken)
            });
    }

    export function connectNotifications(connection: IConnection, target: IDiagramServer): Disposable {
        const notificationsHandler: NotificationsHandler = {}
        notificationsHandler["elementSelected"] = (params) => target.elementSelected(params);
        const registration = connection.addNotificationHandler(notificationsHandler);
        return registration;
    }

    export interface IConnection {
        addNotificationHandler(handler: NotificationsHandler) : Disposable
    }

    export interface NotificationsHandler {
        [method: string]: GenericNotificationHandler
    }
}

// RPC method definitions

export namespace GetDiagramRequest {
    export const type = new RequestType1<GetDiagramParams, GModelRootSchema, void, void>('getDiagram');
}

export namespace ElementSelectedNotification {
    export const type = new NotificationType1<SelectionParams, void>('elementSelected');
}
