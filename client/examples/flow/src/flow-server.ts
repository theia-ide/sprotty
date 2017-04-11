import {
    ActionHandlerRegistry, IActionDispatcher, RequestModelAction, TYPES, UpdateModelAction, ViewRegistry
} from "../../../src/base"
import { SGraphView } from "../../../src/graph"
import { SelectCommand, SetBoundsCommand, ComputedBoundsAction } from "../../../src/features"
import { BarrierNodeView, ExecutionNodeView, FlowEdgeView } from "./views"
import createContainer from "./di.config"
import { WebSocketDiagramServer } from "../../../src/remote"

const WebSocket = require("reconnecting-websocket")

function getXtextServices(): any {
    return (window as any).xtextServices
}

function requestModel(): RequestModelAction {
    return new RequestModelAction('flow', undefined, {
        resourceId: getXtextServices().options.resourceId
    })
}

export function setupFlow(websocket: WebSocket) {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get<ActionHandlerRegistry>(TYPES.ActionHandlerRegistry)
    const dispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher)
    actionHandlerRegistry.registerServerMessage(SelectCommand.KIND)
    actionHandlerRegistry.registerServerMessage(RequestModelAction.KIND)
    actionHandlerRegistry.registerServerMessage(ComputedBoundsAction.KIND)

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
        function run() {
            if (getXtextServices() !== undefined)
                dispatcher.dispatch(requestModel())
            else
                setTimeout(run, 50)
        }
        run()
    })
}

export default function runFlowServer() {
    const websocket = new WebSocket('ws://localhost:8080/diagram')
    setupFlow(websocket)
}
