import {ContainerModule, interfaces} from "inversify"
import {NullLogger} from "../utils"
import { DiagramServer } from "../remote"
import {
    ActionDispatcher, CommandStack, ActionHandlerRegistry, ServerActionHandler, ServerActionHandlerFactory,
    ActionHandler, SetModelCommand
} from "./intent"
import {
    Viewer, ViewRegistry, ViewerOptions, FocusFixDecorator, MouseTool, KeyTool
} from "./view"
import {SModelFactory} from "./model"
import { TYPES } from "./types"

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
        baseDiv: 'sprotty'
    })

    // Tools & Decorators --------------------------------------
    bind(TYPES.VNodeDecorator).to(MouseTool).inSingletonScope()
    bind(TYPES.VNodeDecorator).to(KeyTool).inSingletonScope()
    bind(TYPES.VNodeDecorator).to(FocusFixDecorator).inSingletonScope()

    // Registries ---------------------------------------------
    bind(ActionHandlerRegistry).toSelf().inSingletonScope()
    bind(ViewRegistry).toSelf().inSingletonScope()

    // Model Factory ---------------------------------------------
    bind(SModelFactory).toSelf().inSingletonScope()

    // Action Handlers ---------------------------------------------
    bind(TYPES.ServerActionHandlerFactory).toFactory<ServerActionHandler>((context: interfaces.Context) => {
        return (immediateHandler?: ActionHandler) => {
            const diagramServer = context.container.get<DiagramServer>(TYPES.DiagramServer)
            return new ServerActionHandler(diagramServer, immediateHandler)
        }
    })

    // Commands
    bind(TYPES.ICommand).toConstructor(SetModelCommand)
})

export default defaultContainerModule
