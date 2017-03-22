import {
    ActionDispatcher,
    MoveCommand,
    MoveAction,
    SelectCommand,
    SelectAction,
    ActionHandlerRegistry,
    ViewRegistry,
    CommandActionHandler,
    RequestModelAction
} from "../../../src/base"
import {SGraphView, StraightEdgeView} from "../../../src/graph"
import {DiagramServer} from "../../../src/jsonrpc"
import {CircleNodeView} from "./views"
import createContainer from "./inversify.config"
import {ViewportAction, ViewportCommand} from "../../../src/base/behaviors/viewport"
import {MouseTool} from "../../../src/base/view/mouse-tool"
import {SelectMouseListener} from "../../../src/base/behaviors/select"
import {MoveMouseListener} from "../../../src/base/behaviors/move"
import {ScrollMouseListener} from "../../../src/base/behaviors/scroll"
import {ZoomMouseListener} from "../../../src/base/behaviors/zoom"
import {KeyTool} from "../../../src/base/view/key-tool"
import {UndoRedoKeyListener} from "../../../src/base/behaviors/undo-redo"

export default function runSimpleServer() {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get(ActionHandlerRegistry)
    const dispatcher = container.get(ActionDispatcher)
    actionHandlerRegistry.registerCommand(MoveAction.KIND, MoveCommand)
    actionHandlerRegistry.registerCommand(ViewportAction.KIND, ViewportCommand)
    actionHandlerRegistry.registerServerNotification(SelectAction.KIND, new CommandActionHandler(SelectCommand))
    actionHandlerRegistry.registerServerRequest(RequestModelAction.KIND)

    // Register views
    const viewRegistry = container.get(ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:circle', CircleNodeView)
    viewRegistry.register('edge:straight', StraightEdgeView)

    // Register tools
    const mouseTool = container.get(MouseTool)
    mouseTool.register(new SelectMouseListener())
    mouseTool.register(new MoveMouseListener())
    mouseTool.register(new ScrollMouseListener())
    mouseTool.register(new ZoomMouseListener())

    const keyTool = container.get(KeyTool)
    keyTool.register(new UndoRedoKeyListener())

    // Connect to the diagram server
    const diagramServer = container.get(DiagramServer)
    diagramServer.connectWebSocket('ws://localhost:62000').then(connection => {
        // Run
        const action = new RequestModelAction()
        dispatcher.dispatch(action)
    })

}
