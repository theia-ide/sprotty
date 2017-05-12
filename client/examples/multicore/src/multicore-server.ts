import { RequestModelAction, TYPES, IActionHandler, ActionHandlerRegistry } from "../../../src/base"
import { SelectAction, SelectCommand } from "../../../src/features"
import { WebSocketDiagramServer } from "../../../src/remote"
import createContainer from "./di.config"
import { IActionDispatcher } from "../../../src/base/intent/action-dispatcher"
import { InitializeCanvasBoundsAction } from "../../../src/base/features/initialize-canvas"

const WebSocket = require("reconnecting-websocket")

function getXtextServices(): any {
    return (window as any).xtextServices
}

class SelectionHandler implements IActionHandler {
    handle(action: SelectAction): void {
        const xtextService = getXtextServices()
        if (xtextService !== undefined && !action.deselectAll) {
            const selectedElement = action.selectedElementsIDs.length > 0 ? action.selectedElementsIDs[0] : 'processor'
            xtextService.select({
                elementId: selectedElement,
                modelType: 'processor'
            })
        }
    }
}

export function setupMulticore(websocket: WebSocket) {
    const container = createContainer(true)

    // Set up selection handling
    const actionHandlerRegistry = container.get<ActionHandlerRegistry>(TYPES.ActionHandlerRegistry)
    actionHandlerRegistry.register(SelectCommand.KIND, new SelectionHandler())

    // Connect to the diagram server
    const diagramServer = container.get<WebSocketDiagramServer>(TYPES.ModelSource)
    diagramServer.listen(websocket)
    websocket.addEventListener('open', event => {
        // Run
        function run() {
            const xtextServices = getXtextServices()
            if (xtextServices !== undefined)
                diagramServer.handle(new RequestModelAction('processor', undefined, {
                    resourceId: xtextServices.options.resourceId
                }))
            else
                setTimeout(run, 50)
        }
        run()
    })
}

export default function runMulticoreServer() {
    const websocket = new WebSocket('ws://' + window.location.host + '/diagram')
    setupMulticore(websocket)
}
