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
import {SelectMouseListener} from "../../../src/base/behaviors/select"
import {ScrollMouseListener} from "../../../src/base/behaviors/scroll"
import {ZoomMouseListener} from "../../../src/base/behaviors/zoom"

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

    // Register tools
    const mouseTool = container.get(MouseTool)
    mouseTool.register(new SelectMouseListener())
    mouseTool.register(new ScrollMouseListener())
    mouseTool.register(new ZoomMouseListener())

    // Connect to the diagram server
    const diagramServer = container.get(DiagramServer)
    diagramServer.connectWebSocket('ws://localhost:8080/diagram').then(connection => {
        // Run
        const action = new RequestModelAction()
        dispatcher.dispatch(action)
    })
}