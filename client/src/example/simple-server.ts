import { createMessageConnection } from 'vscode-jsonrpc'
import {EventLoop} from "../base"
import {GGraphView, StraightEdgeView} from "../graph/view"
import {
    CommandStack, ActionDispatcher, MoveCommand, MoveKind, SelectKind, SelectCommand, CommandActionHandler,
    FetchModelKind, FetchModelAction, FetchModelHandler
} from "../base/intent"
import {Viewer} from "../base/view"
import {DiagramServer, WebSocketMessageReader, WebSocketMessageWriter, ConsoleLogger} from "../jsonrpc"
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

    // Create WebSocket connection
    const webSocket = new WebSocket('ws://localhost:62000')
    const connection = createMessageConnection(
        new WebSocketMessageReader(webSocket),
        new WebSocketMessageWriter(webSocket),
        new ConsoleLogger()
    )
    const diagramServer = new DiagramServer(connection)
    eventLoop.dispatcher.registerSourceDelegate(FetchModelKind, FetchModelHandler, diagramServer)

    // Run
    const action = new FetchModelAction({});
    eventLoop.dispatcher.dispatch(action);

}
