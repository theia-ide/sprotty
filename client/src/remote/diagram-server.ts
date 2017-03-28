import { Action } from "../base/intent/actions"

export interface IDiagramServer {
    sendAction(action: Action): void

    onAction(listener: (Action) => void)
}
