import {
    ActionDispatcher,
    ActionHandlerRegistry,
    ViewRegistry,
    CommandActionHandler,
    RequestModelAction
} from "../../../src/base"
import {DiagramServer} from "../../../src/jsonrpc"
import {ChipView, CoreView, ChannelView, CrossbarView} from "./views"
import createContainer from "./inversify.config"
import {SelectCommand} from "../../../src/features/select/select"

export default function runMulticoreServer() {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get(ActionHandlerRegistry)
    const dispatcher = container.get(ActionDispatcher)
    actionHandlerRegistry.registerServerNotification(SelectCommand.KIND, new CommandActionHandler(SelectCommand))
    actionHandlerRegistry.registerServerRequest(RequestModelAction.KIND)

    // Register views
    const viewRegistry = container.get(ViewRegistry)
    viewRegistry.register('chip', ChipView)
    viewRegistry.register('core', CoreView)
    viewRegistry.register('crossbar', CrossbarView)
    viewRegistry.register('channel', ChannelView)

    // Connect to the diagram server
    const diagramServer = container.get(DiagramServer)
    diagramServer.connectWebSocket('ws://localhost:8080/diagram').then(connection => {
        // Run
        const action = new RequestModelAction()
        dispatcher.dispatch(action)
    })
}