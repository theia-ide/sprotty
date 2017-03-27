import {
    ActionDispatcher, SelectCommand, ActionHandlerRegistry, ViewRegistry, RequestModelAction,
    MouseTool, KeyTool
} from "../../../src/base"
import {
    SelectMouseListener, MoveMouseListener, ScrollMouseListener, ZoomMouseListener, ViewportAction,
    ViewportCommand, UndoRedoKeyListener
} from "../../../src/features"
import {SGraphView, StraightEdgeView} from "../../../src/graph"
import { WebSocketDiagramServer } from "../../../src/remote"
import {CircleNodeView} from "./views"
import createContainer from "./inversify.config"

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
