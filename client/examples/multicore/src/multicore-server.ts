import {
    ActionDispatcher,
    SelectCommand,
    SelectAction,
    ActionHandlerRegistry,
    ViewRegistry,
    CommandActionHandler,
    RequestModelAction
} from "../../../src/base"
import {DiagramServer} from "../../../src/jsonrpc"
import {ChipView, CoreView, ChannelView, CrossbarView} from "./views"
import createContainer from "./inversify.config"
import {MouseTool} from "../../../src/base/view/mouse-tool"
import {SelectMouseListener} from "../../../src/features/select/select"
import {ScrollMouseListener} from "../../../src/features/viewport/scroll"
import {ZoomMouseListener} from "../../../src/features/viewport/zoom"

export default function runMulticoreServer() {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get(ActionHandlerRegistry)
    const dispatcher = container.get(ActionDispatcher)
    actionHandlerRegistry.registerServerNotification(SelectAction.KIND, new CommandActionHandler(SelectCommand))
    actionHandlerRegistry.registerServerRequest(RequestModelAction.KIND)

    // Register views
    const viewRegistry = container.get(ViewRegistry)
    viewRegistry.register('chip', ChipView)
    viewRegistry.register('core', CoreView)
    viewRegistry.register('crossbar', CrossbarView)
    viewRegistry.register('channel', ChannelView)

    // Connect to the diagram server
    const diagramServer = container.get(DiagramServer)
    diagramServer.connectWebSocket('ws://localhost:8080/diagram').then(connection => {
        // Run
        const action = new RequestModelAction()
        dispatcher.dispatch(action)
    })
}