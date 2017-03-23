import {
    ActionDispatcher, SelectCommand, SelectAction, ActionHandlerRegistry, RequestOnUpdateHandler,
    ViewRegistry, CommandActionHandler, RequestModelAction, ResizeAction, ViewportAction, ViewportCommand,
    UpdateModelAction
} from "../../../src/base"
import {SGraphView, StraightEdgeView} from "../../../src/graph"
import {DiagramServer} from "../../../src/jsonrpc"
import {ExecutionNodeView, BarrierNodeView} from "./views"
import createContainer from "./inversify.config"
import {MouseTool} from "../../../src/base/view/mouse-tool"
import {SelectMouseListener} from "../../../src/base/behaviors/select"
import {ScrollMouseListener} from "../../../src/base/behaviors/scroll"
import {ZoomMouseListener} from "../../../src/base/behaviors/zoom"

export default function runFlowServer() {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get(ActionHandlerRegistry)
    const dispatcher = container.get(ActionDispatcher)
    actionHandlerRegistry.registerServerNotification(SelectAction.KIND, new CommandActionHandler(SelectCommand))
    actionHandlerRegistry.registerServerRequest(RequestModelAction.KIND)
    actionHandlerRegistry.registerServerRequest(ResizeAction.KIND)
    actionHandlerRegistry.registerCommand(ViewportAction.KIND, ViewportCommand)
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