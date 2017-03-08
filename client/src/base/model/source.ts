import {
    CancellationToken, Disposable, GenericNotificationHandler, MessageConnection, NotificationType1, RequestType1
} from 'vscode-jsonrpc';
import {GModelRootSchema} from "./gmodel-schema";

export interface IDiagramServer extends Disposable {

    getDiagram(params: GetDiagramParams, token?: CancellationToken): Thenable<GModelRootSchema>;

    elementSelected(params: SelectionParams): void;

}

export interface GetDiagramParams {
    options?: any;
}

export interface SelectionParams {
    options?: any;
}
