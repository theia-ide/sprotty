import {ActionDispatcher} from "./intent/ActionDispatcher"
import {CommandStack} from "./intent/CommandStack"
import {Viewer} from "./view/Viewer"

/**
 * Plugs the base components together.
 */
export class EventLoop {

    constructor(public dispatcher: ActionDispatcher, public commandStack: CommandStack, public viewer: Viewer) {
        this.dispatcher.register(this.commandStack)
        this.commandStack.register(this.viewer)
        this.viewer.register(this.dispatcher)
    }
}