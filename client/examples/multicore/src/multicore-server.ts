import {
    ActionDispatcher,
    SelectCommand,
    ActionHandlerRegistry,
    ViewRegistry,
    RequestModelAction
} from "../../../src/base"
import { WebSocketDiagramServer } from "../../../src/remote"
import {ChipView, CoreView, ChannelView, CrossbarView} from "./views"
import createContainer from "./inversify.config"

export default function runMulticoreServer() {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get(ActionHandlerRegistry)
    const dispatcher = container.get(ActionDispatcher)
    actionHandlerRegistry.registerServerMessage(SelectCommand.KIND, SelectCommand)
    actionHandlerRegistry.registerServerMessage(RequestModelAction.KIND)

    // Register views
    const viewRegistry = container.get(ViewRegistry)
    viewRegistry.register('chip', ChipView)
    viewRegistry.register('core', CoreView)
    viewRegistry.register('crossbar', CrossbarView)
    viewRegistry.register('channel', ChannelView)

    // Connect to the diagram server
    const diagramServer = container.get(WebSocketDiagramServer)
    diagramServer.connect('ws://localhost:8080/diagram').then(() => {
        // Run
        const action = new RequestModelAction()
        dispatcher.dispatch(action)
    })
}
