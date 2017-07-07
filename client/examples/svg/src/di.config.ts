/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify"
import {
    defaultModule, TYPES, ViewRegistry, ConsoleLogger, LogLevel, boundsModule, moveModule, selectModule,
    undoRedoModule, viewportModule, hoverModule, LocalModelSource, PreRenderedView, SvgViewportView, 
    exportModule
} from "../../../src"
import { SvgFactory } from "./model-factory"

const svgModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(SvgFactory).inSingletonScope()
    bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope()
})

export default () => {
    const container = new Container()
    container.load(defaultModule, selectModule, moveModule, boundsModule, undoRedoModule, viewportModule, hoverModule, exportModule, svgModule)

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('svg', SvgViewportView)
    viewRegistry.register('pre-rendered', PreRenderedView)

    return container
}
