import {
    TYPES, ActionDispatcher, MoveCommand, MoveAction, SelectCommand, SelectAction,
    ActionHandlerRegistry, ViewRegistry, CommandActionHandler, RequestModelAction
} from "../../../src/base"
import {GGraphView, StraightEdgeView} from "../../../src/graph"
import {DiagramServerProvider} from "../../../src/jsonrpc"
import {CircleNodeView} from "./views"
import createContainer from "./inversify.config"

export default function runSimpleServer() {
    const container = createContainer()

    // Register commands
    const actionHandlerRegistry = container.get(ActionHandlerRegistry)
    const dispatcher = container.get(ActionDispatcher)
    actionHandlerRegistry.registerCommand(MoveAction.KIND, MoveCommand)
    actionHandlerRegistry.registerServerNotification(SelectAction.KIND, new CommandActionHandler(SelectCommand))
    actionHandlerRegistry.registerServerRequest(RequestModelAction.KIND)

    // Register views
    const viewRegistry = container.get(ViewRegistry)
    viewRegistry.register('graph', GGraphView)
    viewRegistry.register('node:circle', CircleNodeView)
    viewRegistry.register('edge:straight', StraightEdgeView)

    // Connect to the diagram server
    container.get<DiagramServerProvider>(TYPES.DiagramServerProvider)().then((diagramServer) => {
        // Run
        const action = new RequestModelAction();
        dispatcher.dispatch(action);
    })

}
