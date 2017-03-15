// this file is generated from /diagram-api/src/main/java/io/typefox/sprotte/api/DiagramProtocol.xtend
import {
    CancellationToken, Disposable, GenericNotificationHandler, MessageConnection, NotificationType1, RequestType1
} from 'vscode-jsonrpc';

export interface IDiagramServer extends Disposable {

    requestModel(params: RequestModelAction, token?: CancellationToken): Thenable<SetModelAction>;

    elementSelected(params: SelectAction): void;
}

export class DiagramServer implements IDiagramServer {

    protected connection: MessageConnection;

    constructor(connection: MessageConnection) {
        this.connection = connection;
    }

    dispose() {
    }

    requestModel(params: RequestModelAction, token?: CancellationToken): Thenable<SetModelAction> {
        token = token || CancellationToken.None;
        return this.connection.sendRequest(RequestModelRequest.type, params, token);
    }

    elementSelected(params: SelectAction): void {
        return this.connection.sendNotification(ElementSelectedNotification.type, params);
    }

}

export namespace DiagramServer {
    export function connect(connection: MessageConnection, target: IDiagramServer): void {
        connection.onRequest("requestModel", 
            (params, cancelToken) => {
                return target.requestModel(params, cancelToken)
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

export interface IDiagramClient extends Disposable {
}

export class DiagramClient implements IDiagramClient {

    protected connection: MessageConnection;

    constructor(connection: MessageConnection) {
        this.connection = connection;
    }

    dispose() {
    }

}

export namespace DiagramClient {
    export function connect(connection: MessageConnection, target: IDiagramClient): void {
    }
}

// RPC method definitions
export namespace RequestModelRequest {
    export const type = new RequestType1<RequestModelAction, SetModelAction, void, void>('requestModel');
}
export namespace ElementSelectedNotification {
    export const type = new NotificationType1<SelectAction, void>('elementSelected');
}

// param and result definitions

export interface RequestModelAction {
    kind?: string;
}

export interface GModelElement {
    type: string;
    id: string;
    children?: GModelElement[];
    parent?: GModelElement;
}

export interface GModelRoot extends GModelElement {
}

export interface SetModelAction {
    kind?: string;
    newRoot?: GModelRoot;
}

export interface SelectAction {
    kind?: string;
    selectedElementsIDs?: string[];
    deselectedElementsIDs?: string[];
}
