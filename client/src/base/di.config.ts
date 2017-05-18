/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule, interfaces } from "inversify"
import { SModelStorage } from './model/smodel-storage';
import { CanvasBoundsInitializer, InitializeCanvasBoundsCommand } from './features/initialize-canvas';
import { LogLevel, NullLogger } from "../utils/logging"
import { ActionDispatcher, IActionDispatcher } from "./intent/action-dispatcher"
import { CommandStack, ICommandStack } from "./intent/command-stack"
import { IViewer, Viewer, ModelRenderer } from "./view/viewer"
import { ViewerOptions } from "./view/options"
import { MouseTool, PopupMouseTool } from "./view/mouse-tool"
import { KeyTool } from "./view/key-tool"
import { FocusFixDecorator, IVNodeDecorator } from "./view/vnode-decorators"
import { ActionHandlerRegistry } from "./intent/actions"
import { ViewRegistry } from "./view/views"
import { SModelFactory } from "./model/smodel-factory"
import { ViewerCache } from "./view/viewer-cache"
import { AnimationFrameSyncer } from "./animations/animation-frame-syncer"
import { TYPES } from "./types"

let defaultContainerModule = new ContainerModule(bind => {
    // Logging ---------------------------------------------
    bind(TYPES.ILogger).to(NullLogger).inSingletonScope()
    bind(TYPES.LogLevel).toConstantValue(LogLevel.warn)

    // Registries ---------------------------------------------
    bind(TYPES.ActionHandlerRegistry).to(ActionHandlerRegistry).inSingletonScope()
    bind(TYPES.ViewRegistry).to(ViewRegistry).inSingletonScope()

    // Model Creation ---------------------------------------------
    bind(TYPES.IModelFactory).to(SModelFactory).inSingletonScope()

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
        baseClass: 'sprotty',
        hiddenClass: 'sprotty-hidden',
        popupDiv: 'sprotty-popup',
        popupClass: 'sprotty-popup',
        popupClosedClass: 'sprotty-popup-closed',
        boundsComputation: 'fixed',
        popupOpenDelay: 700,
        popupCloseDelay: 300
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
    bind(TYPES.PopupVNodeDecorator).to(PopupMouseTool).inSingletonScope()

    // Animation Frame Sync ------------------------------------------
    bind(TYPES.AnimationFrameSyncer).to(AnimationFrameSyncer).inSingletonScope()

    // Canvas Initialization ---------------------------------------------
    bind(TYPES.ICommand).toConstructor(InitializeCanvasBoundsCommand)
    bind(TYPES.IVNodeDecorator).to(CanvasBoundsInitializer).inSingletonScope()
    bind(TYPES.SModelStorage).to(SModelStorage).inSingletonScope
})

export default defaultContainerModule
