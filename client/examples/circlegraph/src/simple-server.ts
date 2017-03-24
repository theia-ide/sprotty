import {
    ActionDispatcher,
    MoveCommand,
    MoveAction,
    SelectCommand,
    SelectAction,
    ActionHandlerRegistry,
    ViewRegistry,
    RequestModelAction
} from "../../../src/base"
import {SGraphView, StraightEdgeView} from "../../../src/graph"
import {CircleNodeView} from "./views"
import createContainer from "./inversify.config"
import {ViewportAction, ViewportCommand} from "../../../src/features/viewport/viewport"
import {MouseTool} from "../../../src/base/view/mouse-tool"
import {SelectMouseListener} from "../../../src/features/select/select"
import {MoveMouseListener} from "../../../src/features/move"
import {ScrollMouseListener} from "../../../src/features/viewport/scroll"
import {ZoomMouseListener} from "../../../src/features/viewport/zoom"
import {KeyTool} from "../../../src/base/view/key-tool"
import { UndoRedoKeyListener } from "../../../src/features/undo-redo/undo-redo"
import { WebSocketDiagramServer } from "../../../src/remote"

export default function runSimpleServer() {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get(ActionHandlerRegistry)
    const dispatcher = container.get(ActionDispatcher)

    actionHandlerRegistry.registerServerMessage(SelectCommand.KIND, SelectCommand)
    actionHandlerRegistry.registerServerMessage(RequestModelAction.KIND)

    // Register views
    const viewRegistry = container.get(ViewRegistry)
    viewRegistry.register('graph', SGraphView)
    viewRegistry.register('node:circle', CircleNodeView)
    viewRegistry.register('edge:straight', StraightEdgeView)

    // Connect to the diagram server
    const diagramServer = container.get(WebSocketDiagramServer)
    diagramServer.connect('ws://localhost:62000').then(() => {
        // Run
        const action = new RequestModelAction()
        dispatcher.dispatch(action)
    })

}
