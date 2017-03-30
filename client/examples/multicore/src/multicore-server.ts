import WebSocket = require("reconnecting-websocket")
import {
    TYPES, IActionDispatcher, ActionHandlerRegistry, ViewRegistry, RequestModelAction, UpdateModelAction, Action
} from "../../../src/base"
import { SelectCommand, SetBoundsCommand, CenterAction } from "../../../src/features"
import { WebSocketDiagramServer } from "../../../src/remote"
import { ProcessorView, CoreView, ChannelView, CrossbarView } from "./views"
import createContainer from "./di.config"
import {FitToScreenAction} from "../../../src/features/viewport/center-fit"

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

export function setupMulticore(websocket: WebSocket) {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get<ActionHandlerRegistry>(TYPES.ActionHandlerRegistry)
    const dispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher)
    actionHandlerRegistry.registerServerMessage(SelectCommand.KIND)
    actionHandlerRegistry.registerServerMessage(RequestModelAction.KIND)
    actionHandlerRegistry.registerTranslator(UpdateModelAction.KIND, update => new RequestModelAction('processor'))
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
        const action = new RequestModelAction('processor')
        dispatcher.dispatch(action)
    })
}

export default function runMulticoreServer() {
    const websocket = createWebSocket('ws://localhost:8080/diagram')
    setupMulticore(websocket)
}
