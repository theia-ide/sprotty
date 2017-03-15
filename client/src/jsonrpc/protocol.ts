import {CancellationToken, MessageConnection, NotificationType1, RequestType1} from "vscode-jsonrpc"
import {Action} from "../base/intent/actions"

export class DiagramServer {

    protected connection: MessageConnection;

    constructor(connection: MessageConnection) {
        this.connection = connection;
    }

    dispose() {
    }

    request(params: Action, token?: CancellationToken): Thenable<Action[]> {
        token = token || CancellationToken.None;
        return this.connection.sendRequest(ActionRequest.type, params, token);
    }

    notify(params: Action): void {
        return this.connection.sendNotification(ActionNotification.type, params);
    }
}

export namespace ActionRequest {
    export const type = new RequestType1<Action, Action[], void, void>('requestAction');
}

export namespace ActionNotification {
    export const type = new NotificationType1<Action, void>('notifyAction');
}
