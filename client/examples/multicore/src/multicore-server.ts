import {EventLoop} from "../../../src/base"
import {
    CommandStack, ActionDispatcher, SelectCommand, NotificationActionHandler, CommandActionHandler
} from "../../../src/base/intent"
import {Viewer} from "../../../src/base/view"
import {DiagramServer, connectDiagramServer} from "../../../src/jsonrpc"
import {ChipView, CoreView, ChannelView, CrossbarView} from "./views"
import {RequestModelAction} from "../../../src/base/intent/model-manipulation"
import {ChipModelFactory} from "./chipmodel-factory"
import {SelectAction} from "../../../src/base/intent/select"

export default function runMulticoreServer() {
    // Setup event loop
    const eventLoop = new EventLoop(
        new ActionDispatcher(),
        new CommandStack(new ChipModelFactory()),
        new Viewer('sprotte')
    );

    eventLoop.dispatcher.registerServerNotification(SelectAction.KIND,
        new NotificationActionHandler(eventLoop.dispatcher, new CommandActionHandler(SelectCommand)))
    eventLoop.dispatcher.registerServerRequest(RequestModelAction.KIND)

    // Register views
    const viewComponentRegistry = eventLoop.viewer.viewRegistry
    viewComponentRegistry.register('chip', ChipView)
    viewComponentRegistry.register('core', CoreView)
    viewComponentRegistry.register('crossbar', CrossbarView)
    viewComponentRegistry.register('channel', ChannelView)

    // Connect to the diagram server
    connectDiagramServer('ws://localhost:8080/diagram').then((diagramServer: DiagramServer) => {
        eventLoop.dispatcher.connect(diagramServer)
        // Run
        const action = new RequestModelAction();
        eventLoop.dispatcher.dispatch(action);
    })
}