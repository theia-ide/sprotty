/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify"
import {
    defaultModule, TYPES, ViewRegistry, overrideViewerOptions, ConsoleLogger, LogLevel, WebSocketDiagramServer,
    boundsModule, moveModule, fadeModule, hoverModule, viewportModule, selectModule, SGraphView, LocalModelSource,
    HtmlRootView, PreRenderedView, exportModule
} from "../../../src"
import { FlowModelFactory } from "./flowmodel-factory"
import { TaskNodeView, BarrierNodeView, FlowEdgeView } from "./views"

const flowModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(FlowModelFactory).inSingletonScope()
})

export default (useWebsocket: boolean) => {
    const container = new Container()
    container.load(defaultModule, selectModule, moveModule, boundsModule, fadeModule, viewportModule, flowModule, exportModule, hoverModule)
    if (useWebsocket)
        container.bind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope()
    else
        container.bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope()
    overrideViewerOptions(container, {
        baseDiv: 'sprotty-flow',
        hiddenDiv: 'sprotty-hidden-flow',
        popupDiv: 'sprotty-popup-flow',
        needsClientLayout: false,
        needsServerLayout: true
    })

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('flow', SGraphView)
    viewRegistry.register('task', TaskNodeView)
    viewRegistry.register('barrier', BarrierNodeView)
    viewRegistry.register('edge', FlowEdgeView)
    viewRegistry.register('html', HtmlRootView)
    viewRegistry.register('pre-rendered', PreRenderedView)

    return container
}
