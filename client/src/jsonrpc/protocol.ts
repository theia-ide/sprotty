import {
    CancellationToken, MessageConnection, NotificationType1, RequestType1
} from 'vscode-jsonrpc';
import {IModelSource, GetDiagramParams, SelectionParams, GModelRootSchema} from "../base/model";

export class DiagramServer implements IModelSource {

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

// RPC method definitions

export namespace GetDiagramRequest {
    export const type = new RequestType1<GetDiagramParams, GModelRootSchema, void, void>('getDiagram');
}

export namespace ElementSelectedNotification {
    export const type = new NotificationType1<SelectionParams, void>('elementSelected');
}
