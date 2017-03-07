import {ActionDispatcher, CommandStack} from "./intent"
import {Viewer} from "./view"

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