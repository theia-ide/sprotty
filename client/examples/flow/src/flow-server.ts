import {
    ActionDispatcher, SelectCommand, SelectAction, ActionHandlerRegistry, RequestOnUpdateHandler,
    ViewRegistry, CommandActionHandler, RequestModelAction, UpdateModelAction
} from "../../../src/base"
import {SGraphView, StraightEdgeView} from "../../../src/graph"
import {DiagramServer} from "../../../src/jsonrpc"
import {ExecutionNodeView, BarrierNodeView} from "./views"
import createContainer from "./inversify.config"
import {ResizeCommand} from "../../../src/features/resize/resize"

export default function runFlowServer() {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get(ActionHandlerRegistry)
    const dispatcher = container.get(ActionDispatcher)
    actionHandlerRegistry.registerServerNotification(SelectCommand.KIND, new CommandActionHandler(SelectCommand))
    actionHandlerRegistry.registerServerRequest(RequestModelAction.KIND)
    actionHandlerRegistry.registerServerRequest(ResizeCommand.KIND)
    actionHandlerRegistry.register(UpdateModelAction.KIND, new RequestOnUpdateHandler())

    // Register views
    const viewRegistry = container.get(ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('execution', ExecutionNodeView)
    viewRegistry.register('barrier', BarrierNodeView)
    viewRegistry.register('edge', StraightEdgeView)

    // Connect to the diagram server
    const diagramServer = container.get(DiagramServer)
    diagramServer.connectWebSocket('ws://localhost:8080/diagram').then(connection => {
        // Run
        const action = new RequestModelAction()
        dispatcher.dispatch(action)
    })
}