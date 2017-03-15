import {EventLoop} from "../../../src/base"
import {
    CommandStack, ActionDispatcher, SelectKind, SelectCommand, FetchModelKind, FetchModelHandler, FetchModelAction
} from "../../../src/base/intent"
import {Viewer} from "../../../src/base/view"
import {DiagramServer, connectDiagramServer} from "../../../src/jsonrpc"
import {ChipView, CoreView, ChannelView, CrossbarView} from "./views"
import XUnit = Mocha.reporters.XUnit

export default function runMulticoreServer() {
    // Setup event loop
    const eventLoop = new EventLoop(
        new ActionDispatcher(),
        new CommandStack(),
        new Viewer('sprotte')
    );

    eventLoop.dispatcher.registerCommand(SelectKind, SelectCommand)

    // Register views
    const viewComponentRegistry = eventLoop.viewer.viewRegistry
    viewComponentRegistry.register('chip', ChipView)
    viewComponentRegistry.register('core', CoreView)
    viewComponentRegistry.register('crossbar', CrossbarView)
    viewComponentRegistry.register('channel', ChannelView)

    // Connect to the diagram server
    connectDiagramServer('ws://localhost:8080/diagram').then((diagramServer: DiagramServer) => {
        eventLoop.dispatcher.registerSourceDelegate(FetchModelKind, FetchModelHandler, diagramServer)

        // Run
        const action = new FetchModelAction({});
        eventLoop.dispatcher.dispatch(action);
    })
}