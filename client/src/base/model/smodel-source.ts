import {CancellationToken, Disposable} from "vscode-jsonrpc"
import {SModelRootSchema} from "./smodel-schema"

export interface IModelSource extends Disposable {

    getDiagram(params: GetDiagramParams, token?: CancellationToken): Thenable<SModelRootSchema>;

    elementSelected(params: SelectionParams): void;

}

export interface GetDiagramParams {
    options?: any;
}

export interface SelectionParams {
    options?: any;
}
