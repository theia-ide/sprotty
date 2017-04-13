import { TYPES, RequestModelAction, ViewRegistry } from "../../../src/base"
import { SelectCommand } from "../../../src/features"
import { SGraphView, StraightEdgeView } from "../../../src/graph"
import { WebSocketDiagramServer } from "../../../src/remote"
import { CircleNodeView } from "./views"
import createContainer from "./di.config"

const WebSocket = require("reconnecting-websocket")

function createWebSocket(url: string, options?: any): WebSocket {
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

export default function runSimpleServer() {
    const container = createContainer(true)

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:circle', CircleNodeView)
    viewRegistry.register('edge:straight', StraightEdgeView)

    // Connect to the diagram server
    const websocket = createWebSocket('ws://localhost:62000')
    const diagramServer = container.get<WebSocketDiagramServer>(TYPES.ModelSource)
    diagramServer.listen(websocket)
    websocket.addEventListener('open', event => {
        // Run
        diagramServer.handle(new RequestModelAction())
    })

}
