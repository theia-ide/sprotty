import { Action } from "../base"

export interface DiagramServer {
    sendAction(action: Action): void

    onAction(listener: (Action) => void)
}
