import { } from '../../../lib/src/features/button/di.config';
/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify"
import {
    defaultModule, TYPES, ViewRegistry, overrideViewerOptions, SGraphView, SLabelView,
    ConsoleLogger, LogLevel, WebSocketDiagramServer, boundsModule, moveModule, selectModule,
    undoRedoModule, viewportModule, hoverModule, LocalModelSource, HtmlRootView, PreRenderedView, 
    exportModule, expandModule, fadeModule, buttonModule
} from "../../../src"
import { MindmapNodeView, PopupButtonView } from "./views"
import { MindmapFactory } from "./model-factory"
import { popupModelFactory, PopupButtonMouseListener } from "./popup"

const mindmapModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(MindmapFactory).inSingletonScope()
    bind(TYPES.PopupModelFactory).toConstantValue(popupModelFactory)
    bind(TYPES.PopupMouseListener).to(PopupButtonMouseListener)    
})

export default (useWebsocket: boolean, containerId: string) => {
    const container = new Container()
    container.load(defaultModule, selectModule, moveModule, boundsModule, 
        undoRedoModule, viewportModule, fadeModule, hoverModule, 
        exportModule, expandModule, buttonModule, mindmapModule)
    if (useWebsocket)
        container.bind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope()
    else
        container.bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope()
    overrideViewerOptions(container, {
        needsClientLayout: false,
        baseDiv: containerId,
        popupOpenDelay: 500
    })

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('mindmap', SGraphView)
    viewRegistry.register('node', MindmapNodeView)
    viewRegistry.register('label', SLabelView)
    viewRegistry.register('html', HtmlRootView)
    viewRegistry.register('pre-rendered', PreRenderedView)
    viewRegistry.register('popup:button', PopupButtonView)
    
    return container
}
