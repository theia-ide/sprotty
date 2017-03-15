import {EventLoop} from "../../../src/base"
import {GGraphView, StraightEdgeView} from "../../../src/graph/view"
import {
    CommandStack,
    ActionDispatcher,
    MoveCommand,
    MoveKind,
    SelectKind,
    SelectCommand,
    RequestModelAction
} from "../../../src/base/intent"
import {Viewer} from "../../../src/base/view"
import {DiagramServer, connectDiagramServer} from "../../../src/jsonrpc"
import {CircleNodeView} from "./views"
import {RequestModelKind} from "../../../src/base/intent/model-manipulation"

export default function runSimpleServer() {
    // Setup event loop
    const eventLoop = new EventLoop(
        new ActionDispatcher(),
        new CommandStack(),
        new Viewer('sprotte')
    );

    eventLoop.dispatcher.registerCommand(MoveKind, MoveCommand)
    eventLoop.dispatcher.registerCommand(SelectKind, SelectCommand)
    eventLoop.dispatcher.registerServerRequest(RequestModelKind)

    // Register views
    const viewComponentRegistry = eventLoop.viewer.viewRegistry
    viewComponentRegistry.register('graph', GGraphView)
    viewComponentRegistry.register('node:circle', CircleNodeView)
    viewComponentRegistry.register('edge:straight', StraightEdgeView)

    // Connect to the diagram server
    connectDiagramServer('ws://localhost:62000').then((diagramServer: DiagramServer) => {
        eventLoop.dispatcher.connect(diagramServer)
        // Run
        const action = new RequestModelAction();
        eventLoop.dispatcher.dispatch(action);
    })

}
