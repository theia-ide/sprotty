import { RequestModelAction, TYPES } from "../../../src/base"
import { WebSocketDiagramServer } from "../../../src/remote"
import createContainer from "./di.config"

const WebSocket = require("reconnecting-websocket")

function getXtextServices(): any {
    return (window as any).xtextServices
}

function requestModel(): RequestModelAction {
    return new RequestModelAction('processor', undefined, {
        resourceId: getXtextServices().options.resourceId
    })
}

export function setupMulticore(websocket: WebSocket) {
    const container = createContainer(true)

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

export default function runMulticoreServer() {
    const websocket = new WebSocket('ws://localhost:8080/diagram')
    setupMulticore(websocket)
}
