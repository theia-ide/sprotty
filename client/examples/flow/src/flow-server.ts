import {
    TYPES, RequestModelAction, ViewRegistry
} from "../../../src/base"
import { SGraphView } from "../../../src/graph"
import { BarrierNodeView, ExecutionNodeView, FlowEdgeView } from "./views"
import { WebSocketDiagramServer } from "../../../src/remote"
import createContainer from "./di.config"

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
    const container = createContainer(true)

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('flow', SGraphView)
    viewRegistry.register('task', ExecutionNodeView)
    viewRegistry.register('barrier', BarrierNodeView)
    viewRegistry.register('edge', FlowEdgeView)

    // Connect to the diagram server
    const diagramServer = container.get<WebSocketDiagramServer>(TYPES.ModelSource)
    diagramServer.listen(websocket)
    websocket.addEventListener('open', event => {
        // Run
        function run() {
            if (getXtextServices() !== undefined)
                diagramServer.handle(requestModel())
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
