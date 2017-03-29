import {
    TYPES, IActionDispatcher, ActionHandlerRegistry, ViewRegistry, RequestModelAction
} from "../../../src/base"
import { SelectCommand } from "../../../src/features"
import { WebSocketDiagramServer } from "../../../src/remote"
import { ProcessorView, CoreView, ChannelView, CrossbarView } from "./views"
import createContainer from "./di.config"

export default function runMulticoreServer() {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get<ActionHandlerRegistry>(TYPES.ActionHandlerRegistry)
    const dispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher)
    actionHandlerRegistry.registerServerMessage(SelectCommand.KIND)
    actionHandlerRegistry.registerServerMessage(RequestModelAction.KIND)

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('processor', ProcessorView)
    viewRegistry.register('core', CoreView)
    viewRegistry.register('crossbar', CrossbarView)
    viewRegistry.register('channel', ChannelView)

    // Connect to the diagram server
    const diagramServer = container.get<WebSocketDiagramServer>(TYPES.IDiagramServer)
    diagramServer.connect('ws://localhost:8080/diagram').then(() => {
        // Run
        const action = new RequestModelAction({type: 'processor'})
        dispatcher.dispatch(action)
    })
}
