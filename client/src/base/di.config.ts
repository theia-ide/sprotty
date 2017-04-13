import { ContainerModule, interfaces } from "inversify"
import { LogLevel, NullLogger } from "../utils/logging"
import { ActionDispatcher, IActionDispatcher } from "./intent/action-dispatcher"
import { CommandStack, ICommandStack } from "./intent/command-stack"
import { IViewer, Viewer, ModelRenderer } from "./view/viewer"
import { IViewerOptions } from "./view/options"
import { MouseTool } from "./view/mouse-tool"
import { KeyTool } from "./view/key-tool"
import { FocusFixDecorator, VNodeDecorator } from "./view/vnode-decorators"
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

    // Animation Frame Sync ------------------------------------------
    bind(TYPES.IAnimationFrameSyncer).to(AnimationFrameSyncer).inSingletonScope()

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
    bind<IViewerOptions>(TYPES.IViewerOptions).toConstantValue({
        baseDiv: 'sprotty',
        boundsComputation: 'fixed'
    })
    bind(TYPES.ModelRendererFactory).toFactory<ModelRenderer>((context: interfaces.Context) => {
        return (decorators: VNodeDecorator[]) => {
            const viewRegistry = context.container.get<ViewRegistry>(TYPES.ViewRegistry)
            return new ModelRenderer(viewRegistry, decorators)
        }
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

    // Model Source
    bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope()
})

export default defaultContainerModule
