import {ContainerModule, interfaces} from "inversify"
import {NullLogger} from "../utils"
import {
    ActionDispatcher,
    CommandStack,
    ActionHandlerRegistry,
    ServerActionHandler,
    ServerActionHandlerFactory,
    ActionHandler
} from "./intent"
import {Viewer, ViewRegistry, ViewerOptions} from "./view"
import {SModelFactory} from "./model"
import {TYPES} from "./types"
import {MouseTool, MouseListener} from "./view/mouse-tool"
import {KeyTool, KeyListener} from "./view/key-tool"
import { SetModelCommand } from "./features/model-manipulation"
import { DiagramServer } from "../remote"

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
    bind(TYPES.MouseListener).to(MouseListener)
    bind(TYPES.VNodeDecorator).to(KeyTool).inSingletonScope()
    bind(TYPES.KeyListener).to(KeyListener)

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
