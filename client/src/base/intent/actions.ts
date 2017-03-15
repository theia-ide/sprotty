import {InstanceRegistry} from "../../utils"
import {Command} from "./commands"

/**
 * An action describes a change to the model declaratively.
 * It is a plain datastructure, as such transferable between server and client.
 */
export interface Action {
    readonly kind: string
}

export interface IActionHandler {

    handle(action: Action): Command[]

}

/**
 * The action handler registry maps actions to their handlers using the Action.kind property.
 */
export class ActionHandlerRegistry extends InstanceRegistry<IActionHandler> {
    constructor() {
        super()
    }
}

export class UndoAction implements Action {
    static readonly KIND = 'Undo'
    kind = UndoAction.KIND
}

export class RedoAction implements Action {
    static readonly KIND = 'Redo'
    kind = RedoAction.KIND
}
