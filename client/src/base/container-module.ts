import {ContainerModule, interfaces} from "inversify"
import {NullLogger} from "../utils"
import { IDiagramServer } from "../remote"
import {
    ActionDispatcher, IActionDispatcher, CommandStack, ICommandStack, ActionHandlerRegistry,
    ServerActionHandler, ServerActionHandlerFactory, ActionHandler
} from "./intent"
import {
    Viewer, IViewer, ViewRegistry, IViewerOptions, FocusFixDecorator, MouseTool, KeyTool
} from "./view"
import {SetModelCommand} from "./features"
import {SModelFactory} from "./model"
import { TYPES } from "./types"

let defaultContainerModule = new ContainerModule(bind => {
    // Logging ---------------------------------------------
    bind(TYPES.ILogger).to(NullLogger).inSingletonScope()

    // Action Dispatcher ---------------------------------------------
    bind(TYPES.IActionDispatcher).to(ActionDispatcher).inSingletonScope()
    bind(TYPES.IActionDispatcherProvider).toProvider<IActionDispatcher>((context) => {
        return () => {
            return new Promise<IActionDispatcher>((resolve) => {
                resolve(context.container.get<IActionDispatcher>(TYPES.IActionDispatcher))
            })
        }
    })

    // Command Stack ---------------------------------------------
    bind(TYPES.ICommandStack).to(CommandStack).inSingletonScope()
    bind(TYPES.ICommandStackProvider).toProvider<ICommandStack>((context) => {
        return () => {
            return new Promise<ICommandStack>((resolve) => {
                resolve(context.container.get<ICommandStack>(TYPES.ICommandStack))
            })
        }
    })

    // Viewer ---------------------------------------------
    bind(TYPES.IViewer).to(Viewer).inSingletonScope()
    bind(TYPES.IViewerProvider).toProvider<IViewer>((context) => {
        return () => {
            return new Promise<IViewer>((resolve) => {
                resolve(context.container.get<IViewer>(TYPES.IViewer))
            })
        }
    })
    bind<IViewerOptions>(TYPES.IViewerOptions).toConstantValue({
        baseDiv: 'sprotty'
    })

    // Tools & Decorators --------------------------------------
    bind(TYPES.VNodeDecorator).to(MouseTool).inSingletonScope()
    bind(TYPES.VNodeDecorator).to(KeyTool).inSingletonScope()
    bind(TYPES.VNodeDecorator).to(FocusFixDecorator).inSingletonScope()

    // Registries ---------------------------------------------
    bind(TYPES.ActionHandlerRegistry).to(ActionHandlerRegistry).inSingletonScope()
    bind(TYPES.ViewRegistry).to(ViewRegistry).inSingletonScope()

    // Model Factory ---------------------------------------------
    bind(TYPES.IModelFactory).to(SModelFactory).inSingletonScope()

    // Action Handlers ---------------------------------------------
    bind(TYPES.ServerActionHandlerFactory).toFactory<ServerActionHandler>((context: interfaces.Context) => {
        return (immediateHandler?: ActionHandler) => {
            const diagramServer = context.container.get<IDiagramServer>(TYPES.IDiagramServer)
            return new ServerActionHandler(diagramServer, immediateHandler)
        }
    })

    // Default commands
    bind(TYPES.ICommand).toConstructor(SetModelCommand)
})

export default defaultContainerModule
