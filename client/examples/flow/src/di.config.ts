/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify"
import { defaultModule, TYPES, ViewRegistry, overrideViewerOptions } from "../../../src/base"
import { ConsoleLogger, LogLevel } from "../../../src/utils"
import { WebSocketDiagramServer } from "../../../src/remote"
import { boundsModule, moveModule, fadeModule, hoverModule } from "../../../src/features"
import { FlowModelFactory } from "./flowmodel-factory"
import { viewportModule } from "../../../src/features"
import { selectModule } from "../../../src/features"
import { SGraphView } from "../../../src/graph"
import { TaskNodeView, BarrierNodeView, FlowEdgeView } from "./views"
import { LocalModelSource } from "../../../src/local/local-model-source"
import { HtmlRootView, PreRenderedView } from "../../../src/lib"

const flowModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(FlowModelFactory).inSingletonScope()
})

export default (useWebsocket: boolean) => {
    const container = new Container()
    container.load(defaultModule, selectModule, moveModule, boundsModule, fadeModule, viewportModule, flowModule, hoverModule)
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
