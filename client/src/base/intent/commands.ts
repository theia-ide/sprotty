import {GModelRoot} from "../model"
import {CommandStackCallback} from "./command-stack"
import {IActionHandler, Action} from "./actions"

/**
 * A command holds the behaviour of an action.
 * It is executed on a command stack and can be undone / redone.
 */
export interface Command {
    execute(element: GModelRoot, context: CommandExecutionContext): GModelRootOrPromise

    undo(element: GModelRoot, context: CommandExecutionContext): GModelRootOrPromise

    redo(element: GModelRoot, context: CommandExecutionContext): GModelRootOrPromise

    merge(command: Command, context: CommandExecutionContext): boolean
}

type GModelRootOrPromise = GModelRoot | Promise<GModelRoot>

export interface CommandExecutionContext {
    root: GModelRoot
    modelChanged: CommandStackCallback
    duration: number
}

export class CommandActionHandler implements IActionHandler {

    constructor(private commandType: new (Action) => Command) {
    }

    handle(action: Action): Command[] {
        return [new this.commandType(action)];
    }

}
