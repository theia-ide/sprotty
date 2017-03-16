import {CancellationToken, MessageConnection, NotificationType1, RequestType1} from "vscode-jsonrpc"
import {Action} from "../base/intent/actions"

export class DiagramServer {

    protected connection: MessageConnection;

    constructor(connection: MessageConnection) {
        this.connection = connection;
    }

    dispose() {
    }

    request(action: Action, token?: CancellationToken): Thenable<Action[]> {
        token = token || CancellationToken.None;
        const requestType = new RequestType1<Action, Action[], void, void>(action.kind)
        return this.connection.sendRequest(requestType, action, token);
    }

    notify(action: Action): void {
        const notificationType = new NotificationType1<Action, void>(action.kind)
        return this.connection.sendNotification(notificationType, action);
    }
}

export type DiagramServerProvider = () => Promise<DiagramServer>
