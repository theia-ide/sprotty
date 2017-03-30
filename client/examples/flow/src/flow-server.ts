import WebSocket = require("reconnecting-websocket")
import {
    TYPES, IActionDispatcher, ActionHandlerRegistry, ViewRegistry, RequestModelAction, UpdateModelAction, Action
} from "../../../src/base"
import { SGraphView } from "../../../src/graph"
import { SelectCommand, SetBoundsCommand } from "../../../src/features"
import { ExecutionNodeView, BarrierNodeView, FlowEdgeView } from "./views"
import createContainer from "./di.config"
import { WebSocketDiagramServer } from "../../../src/remote"

export function createWebSocket(url: string, options?: any): WebSocket {
    if (!options) {
        options = {
            maxReconnectionDelay: 10000,
            minReconnectionDelay: 1000,
            reconnectionDelayGrowFactor: 1.3,
            connectionTimeout: 4000,
            maxRetries: Infinity,
            debug: false
        }
    }
    return new WebSocket(url, undefined, options)
}

export function setupFlow(websocket: WebSocket) {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get<ActionHandlerRegistry>(TYPES.ActionHandlerRegistry)
    const dispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher)
    actionHandlerRegistry.registerServerMessage(SelectCommand.KIND)
    actionHandlerRegistry.registerServerMessage(RequestModelAction.KIND)
    actionHandlerRegistry.registerServerMessage(SetBoundsCommand.KIND)
    actionHandlerRegistry.registerTranslator(UpdateModelAction.KIND, update => new RequestModelAction('flow'))

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('flow', SGraphView)
    viewRegistry.register('task', ExecutionNodeView)
    viewRegistry.register('barrier', BarrierNodeView)
    viewRegistry.register('edge', FlowEdgeView)

    // Connect to the diagram server
    const diagramServer = container.get<WebSocketDiagramServer>(TYPES.IDiagramServer)
    diagramServer.listen(websocket)
    websocket.addEventListener('open', event => {
        // Run
        const action = new RequestModelAction('flow')
        dispatcher.dispatch(action)
    })
}

export default function runFlowServer() {
    const websocket = createWebSocket('ws://localhost:8080/diagram')
    setupFlow(websocket)
}
