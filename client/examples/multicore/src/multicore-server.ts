import {
    TYPES, ActionDispatcher,  SelectCommand, SelectAction, ActionHandlerRegistry, ViewRegistry,CommandActionHandler,
    RequestModelAction
} from "../../../src/base"
import {DiagramServerProvider} from "../../../src/jsonrpc"
import {ChipView, CoreView, ChannelView, CrossbarView} from "./views"
import ContainerFactory from "./inversify.config"

export default function runMulticoreServer() {
    const container = new ContainerFactory().make()

    // Register commands
    const actionHandlerRegistry = container.get<ActionHandlerRegistry>(TYPES.ActionHandlerRegistry)
    const dispatcher = container.get<ActionDispatcher>(TYPES.ActionDispatcher)
    actionHandlerRegistry.registerServerNotification(SelectAction.KIND, new CommandActionHandler(SelectCommand))
    actionHandlerRegistry.registerServerRequest(RequestModelAction.KIND)

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('chip', ChipView)
    viewRegistry.register('core', CoreView)
    viewRegistry.register('crossbar', CrossbarView)
    viewRegistry.register('channel', ChannelView)

    // Connect to the diagram server
    container.get<DiagramServerProvider>(TYPES.DiagramServerProvider)().then((diagramServer) => {
        // Run
        const action = new RequestModelAction();
        dispatcher.dispatch(action);
    })
}