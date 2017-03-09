import {MessageConnection} from "vscode-jsonrpc";
import {EventLoop} from "../base"
import {GGraphView, StraightEdgeView} from "../graph/view"
import {
    CommandStack, ActionDispatcher, MoveCommand, MoveKind, SelectKind, SelectCommand, FetchModelKind, FetchModelAction,
    FetchModelHandler
} from "../base/intent"
import {Viewer} from "../base/view"
import {DiagramServer, connectDiagramServer} from "../jsonrpc"
import {CircleNodeView} from "./views"

export default function runSimpleServer() {
    // Setup event loop
    const eventLoop = new EventLoop(
        new ActionDispatcher(),
        new CommandStack(),
        new Viewer('sprotte')
    );

    eventLoop.dispatcher.registerCommand(MoveKind, MoveCommand)
    eventLoop.dispatcher.registerCommand(SelectKind, SelectCommand)

    // Register views
    const viewComponentRegistry = eventLoop.viewer.viewComponentRegistry
    viewComponentRegistry.register('graph', GGraphView)
    viewComponentRegistry.register('node:circle', CircleNodeView)
    viewComponentRegistry.register('edge:straight', StraightEdgeView)

    // Connect to the diagram server
    connectDiagramServer('ws://localhost:62000').then((diagramServer: DiagramServer) => {
        eventLoop.dispatcher.registerSourceDelegate(FetchModelKind, FetchModelHandler, diagramServer)

        // Run
        const action = new FetchModelAction({});
        eventLoop.dispatcher.dispatch(action);
    })

}
