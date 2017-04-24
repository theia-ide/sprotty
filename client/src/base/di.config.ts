import { SModelStorage } from './model/smodel-storage';
import { CanvasBoundsInitializer, InitializeCanvasBoundsCommand } from './features/initialize-canvas';
import { ContainerModule, interfaces } from "inversify"
import { LogLevel, NullLogger } from "../utils/logging"
import { ActionDispatcher, IActionDispatcher } from "./intent/action-dispatcher"
import { CommandStack, ICommandStack } from "./intent/command-stack"
import { IViewer, Viewer, ModelRenderer } from "./view/viewer"
import { ViewerOptions } from "./view/options"
import { MouseTool } from "./view/mouse-tool"
import { KeyTool } from "./view/key-tool"
import { FocusFixDecorator, IVNodeDecorator } from "./view/vnode-decorators"
import { ActionHandlerRegistry } from "./intent/actions"
import { ViewRegistry } from "./view/views"
import { SModelFactory } from "./model/smodel-factory"
import { TYPES } from "./types"
import { ViewerCache } from "./view/viewer-cache"
import { AnimationFrameSyncer } from "./animations/animation-frame-syncer"
import { LocalModelSource } from "./model/model-source";

let defaultContainerModule = new ContainerModule(bind => {
    // Logging ---------------------------------------------
    bind(TYPES.ILogger).to(NullLogger).inSingletonScope()
    bind(TYPES.LogLevel).toConstantValue(LogLevel.warn)

    // Registries ---------------------------------------------
    bind(TYPES.ActionHandlerRegistry).to(ActionHandlerRegistry).inSingletonScope()
    bind(TYPES.ViewRegistry).to(ViewRegistry).inSingletonScope()

    // Model Creation ---------------------------------------------
    bind(TYPES.IModelFactory).to(SModelFactory).inSingletonScope()
    bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope()

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
    bind(TYPES.IViewer).to(Viewer).inSingletonScope().whenTargetNamed('delegate')
    bind(TYPES.IViewer).to(ViewerCache).inSingletonScope().whenTargetIsDefault()
    bind(TYPES.IViewerProvider).toProvider<IViewer>((context) => {
        return () => {
            return new Promise<IViewer>((resolve) => {
                resolve(context.container.get<IViewer>(TYPES.IViewer))
            })
        }
    })
    bind<ViewerOptions>(TYPES.ViewerOptions).toConstantValue({
        baseDiv: 'sprotty',
        boundsComputation: 'fixed'
    })
    bind(TYPES.ModelRendererFactory).toFactory<ModelRenderer>((context: interfaces.Context) => {
        return (decorators: IVNodeDecorator[]) => {
            const viewRegistry = context.container.get<ViewRegistry>(TYPES.ViewRegistry)
            return new ModelRenderer(viewRegistry, decorators)
        }
    })

    // Tools & Decorators --------------------------------------
    bind(TYPES.IVNodeDecorator).to(MouseTool).inSingletonScope()
    bind(TYPES.IVNodeDecorator).to(KeyTool).inSingletonScope()
    bind(TYPES.IVNodeDecorator).to(FocusFixDecorator).inSingletonScope()

    // Animation Frame Sync ------------------------------------------
    bind(TYPES.AnimationFrameSyncer).to(AnimationFrameSyncer).inSingletonScope()

    // Canvas Initialization ---------------------------------------------
    bind(TYPES.ICommand).toConstructor(InitializeCanvasBoundsCommand)
    bind(TYPES.IVNodeDecorator).to(CanvasBoundsInitializer).inSingletonScope()
    bind(TYPES.SModelStorage).to(SModelStorage).inSingletonScope
})

export default defaultContainerModule
