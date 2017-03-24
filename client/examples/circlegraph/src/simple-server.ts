import {
    ActionDispatcher,
    ActionHandlerRegistry,
    ViewRegistry,
    CommandActionHandler,
    RequestModelAction
} from "../../../src/base"
import {SGraphView, StraightEdgeView} from "../../../src/graph"
import {DiagramServer} from "../../../src/jsonrpc"
import {CircleNodeView} from "./views"
import createContainer from "./inversify.config"
import {SelectCommand} from "../../../src/features/select"

export default function runSimpleServer() {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get(ActionHandlerRegistry)
    const dispatcher = container.get(ActionDispatcher)

    actionHandlerRegistry.registerServerNotification(SelectCommand.KIND, new CommandActionHandler(SelectCommand))
    actionHandlerRegistry.registerServerRequest(RequestModelAction.KIND)

    // Register views
    const viewRegistry = container.get(ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:circle', CircleNodeView)
    viewRegistry.register('edge:straight', StraightEdgeView)

    // Connect to the diagram server
    const diagramServer = container.get(DiagramServer)
    diagramServer.connectWebSocket('ws://localhost:62000').then(connection => {
        // Run
        const action = new RequestModelAction()
        dispatcher.dispatch(action)
    })

}
