import {GModelRoot} from "../model"
import {Registry} from "../../utils"
import {Action} from "./actions"
import {CommandStackCallback} from "./command-stack"
import {SetModelCommand, SetModelKind} from "./set-model"

/**
 * A command holds the behaviour of an action.
 * It is executed on a command stack and can be undone / redone.
 */
export interface Command {
    execute(element: GModelRoot, context: CommandExecutionContext): GModelRootOrPromise
    undo(element: GModelRoot, context: CommandExecutionContext): GModelRootOrPromise
    redo(element: GModelRoot, context: CommandExecutionContext): GModelRootOrPromise

    merge(command: Command): boolean
}

type GModelRootOrPromise = GModelRoot | Promise<GModelRoot>

/**
 * The command registry maps actions to commands using the Action.type property.
 */
export class CommandRegistry extends Registry<Command, Action> {
    constructor() {
        super()
        this.register(SetModelKind, SetModelCommand)
    }
}

export interface CommandExecutionContext {
    root: GModelRoot
    modelChanged: CommandStackCallback
    duration: number
}
