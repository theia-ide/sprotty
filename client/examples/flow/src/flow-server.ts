import {
    ActionDispatcher, SelectCommand, SelectAction, ActionHandlerRegistry, RequestOnUpdateHandler,
    ViewRegistry, RequestModelAction, UpdateModelAction
} from "../../../src/base"
import {SGraphView, StraightEdgeView} from "../../../src/graph"
import {ExecutionNodeView, BarrierNodeView} from "./views"
import createContainer from "./inversify.config"
import { ResizeCommand } from "../../../src/features/resize/resize"
import { WebSocketDiagramServer } from "../../../src/remote"

export default function runFlowServer() {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get(ActionHandlerRegistry)
    const dispatcher = container.get(ActionDispatcher)
    actionHandlerRegistry.registerServerMessage(SelectCommand.KIND, SelectCommand)
    actionHandlerRegistry.registerServerMessage(RequestModelAction.KIND)
    actionHandlerRegistry.registerServerMessage(ResizeCommand.KIND)
    actionHandlerRegistry.register(UpdateModelAction.KIND, new RequestOnUpdateHandler())

    // Register views
    const viewRegistry = container.get(ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('execution', ExecutionNodeView)
    viewRegistry.register('barrier', BarrierNodeView)
    viewRegistry.register('edge', StraightEdgeView)

    // Connect to the diagram server
    const diagramServer = container.get(WebSocketDiagramServer)
    diagramServer.connect('ws://localhost:8080/diagram').then(connection => {
        // Run
        const action = new RequestModelAction()
        dispatcher.dispatch(action)
    })
}
