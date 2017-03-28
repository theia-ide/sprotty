import { ContainerModule, interfaces } from "inversify"
import { NullLogger } from "../utils/logging"
import { IDiagramServer } from "../remote/diagram-server"
import { ActionDispatcher, IActionDispatcher } from "./intent/action-dispatcher"
import { CommandStack, ICommandStack } from "./intent/command-stack"
import { Viewer, IViewer, IViewerOptions } from "./view/viewer"
import { MouseTool } from "./view/mouse-tool"
import { KeyTool } from "./view/key-tool"
import { FocusFixDecorator } from "./view/vnode-decorators"
import { ActionHandlerRegistry, ActionHandler } from "./intent/actions"
import { ViewRegistry } from "./view/views"
import { SModelFactory } from "./model/smodel-factory"
import { ServerActionHandler } from "./intent/server-action-handler"
import { SetModelCommand } from "./features/model-manipulation"
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
