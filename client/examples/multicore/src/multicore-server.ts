import {
    ActionHandlerRegistry, IActionDispatcher, RequestModelAction, TYPES, UpdateModelAction, ViewRegistry
} from "../../../src/base"
import { SelectCommand, SetBoundsCommand } from "../../../src/features"
import { WebSocketDiagramServer } from "../../../src/remote"
import { ChannelView, CoreView, CrossbarView, ProcessorView } from "./views"
import createContainer from "./di.config"
import { FitToScreenAction } from "../../../src/features/viewport/center-fit"

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
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get<ActionHandlerRegistry>(TYPES.ActionHandlerRegistry)
    const dispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher)
    actionHandlerRegistry.registerServerMessage(SelectCommand.KIND)
    actionHandlerRegistry.registerServerMessage(RequestModelAction.KIND)
    actionHandlerRegistry.registerTranslator(UpdateModelAction.KIND, update => requestModel())
    actionHandlerRegistry.registerTranslator(SetBoundsCommand.KIND, update => new FitToScreenAction([]))

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('processor', ProcessorView)
    viewRegistry.register('core', CoreView)
    viewRegistry.register('crossbar', CrossbarView)
    viewRegistry.register('channel', ChannelView)

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

export default function runMulticoreServer() {
    const websocket = new WebSocket('ws://localhost:8080/diagram')
    setupMulticore(websocket)
}
