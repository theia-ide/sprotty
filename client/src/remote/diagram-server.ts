import { Action } from "../base"

export interface IDiagramServer {
    sendAction(action: Action): void

    onAction(listener: (Action) => void)
}
