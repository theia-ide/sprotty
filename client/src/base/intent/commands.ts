import {SModelRoot} from "../model"
import {CommandStackCallback, CommandStack} from "./command-stack"
import {IActionHandler, Action} from "./actions"
import {SModelFactory} from "../model/smodel-factory"

/**
 * A command holds the behaviour of an action.
 * It is executed on a command stack and can be undone / redone.
 */
export interface Command {

    execute(element: SModelRoot, context: CommandExecutionContext): GModelRootOrPromise

    undo(element: SModelRoot, context: CommandExecutionContext): GModelRootOrPromise

    redo(element: SModelRoot, context: CommandExecutionContext): GModelRootOrPromise

    merge(command: Command, context: CommandExecutionContext): boolean
}

type GModelRootOrPromise = SModelRoot | Promise<SModelRoot>

export interface CommandExecutionContext {
    root: SModelRoot
    modelFactory: SModelFactory
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
