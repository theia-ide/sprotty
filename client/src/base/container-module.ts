import {ContainerModule, interfaces} from "inversify"
import {DiagramServer} from "../jsonrpc"
import { NullLogger } from "../utils";
import {
    ActionDispatcher,
    CommandStack,
    ActionHandlerRegistry,
    RequestActionHandler,
    NotificationActionHandler,
    IActionHandler
} from "./intent"
import {Viewer, ViewRegistry, ViewerOptions} from "./view"
import {SModelFactory} from "./model"
import {TYPES} from "./types"
import { IActionDispatcher } from "./intent/action-dispatcher"

let defaultContainerModule = new ContainerModule(bind => {
    // Logging ---------------------------------------------
    bind(TYPES.Logger).to(NullLogger).inSingletonScope()

    // Action Dispatcher ---------------------------------------------
    bind(ActionDispatcher).toSelf().inSingletonScope()
    bind(TYPES.IActionDispatcher).to(ActionDispatcher).inSingletonScope()
    bind(TYPES.ActionDispatcherProvider).toProvider<ActionDispatcher>((context) => {
        return () => {
            return new Promise<ActionDispatcher>((resolve) => {
                resolve(context.container.get(ActionDispatcher))
            })
        }
    })

    // Command Stack ---------------------------------------------
    bind(CommandStack).toSelf().inSingletonScope()
    bind(TYPES.ICommandStack).to(CommandStack).inSingletonScope()
    bind(TYPES.CommandStackProvider).toProvider<CommandStack>((context) => {
        return () => {
            return new Promise<CommandStack>((resolve) => {
                resolve(context.container.get(CommandStack))
            })
        }
    })

    // Viewer ---------------------------------------------
    bind(Viewer).toSelf().inSingletonScope()
    bind(TYPES.IViewer).to(Viewer).inSingletonScope()
    bind(TYPES.ViewerProvider).toProvider<Viewer>((context) => {
        return () => {
            return new Promise<Viewer>((resolve) => {
                resolve(context.container.get(Viewer))
            })
        }
    })
    bind<ViewerOptions>(TYPES.ViewerOptions).toConstantValue({
        baseDiv: 'sprotte'
    })

    // Registries ---------------------------------------------
    bind(ActionHandlerRegistry).toSelf().inSingletonScope()
    bind(ViewRegistry).toSelf().inSingletonScope()

    // Model Factory ---------------------------------------------
    bind(SModelFactory).toSelf().inSingletonScope()

    // Action Handlers ---------------------------------------------
    bind(TYPES.RequestActionHandlerFactory).toFactory<RequestActionHandler>((context: interfaces.Context) => {
        return (immediateHandler?: IActionHandler) => {
            const diagramServer = context.container.get(DiagramServer)
            const actionDispatcher = context.container.get(ActionDispatcher)
            return new RequestActionHandler(diagramServer, actionDispatcher, immediateHandler)
        }
    })
    bind(TYPES.NotificationActionHandlerFactory).toFactory<NotificationActionHandler>((context: interfaces.Context) => {
        return (immediateHandler?: IActionHandler) => {
            const diagramServer = context.container.get(DiagramServer)
            return new NotificationActionHandler(diagramServer, immediateHandler)
        }
    })

    // Diagram Server ---------------------------------------------
    bind(DiagramServer).toSelf().inSingletonScope()
})

export default defaultContainerModule
