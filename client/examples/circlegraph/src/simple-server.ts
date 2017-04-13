import { TYPES, RequestModelAction } from "../../../src/base"
import { WebSocketDiagramServer } from "../../../src/remote"
import createContainer from "./di.config"

const WebSocket = require("reconnecting-websocket")

export default function runSimpleServer() {
    const container = createContainer(true)

    // Connect to the diagram server
    const websocket: WebSocket = new WebSocket('ws://localhost:62000')
    const diagramServer = container.get<WebSocketDiagramServer>(TYPES.ModelSource)
    diagramServer.listen(websocket)
    websocket.addEventListener('open', event => {
        // Run
        diagramServer.handle(new RequestModelAction())
    })

}
