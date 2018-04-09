/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify";
import {
    defaultModule, TYPES, ViewRegistry, overrideViewerOptions, SGraphFactory, SGraphView, PolylineEdgeView,
    ConsoleLogger, LogLevel, WebSocketDiagramServer, boundsModule, moveModule, selectModule, undoRedoModule,
    viewportModule, LocalModelSource, exportModule, SModelElementRegistration, CircularNode
} from "../../../src";
import { CircleNodeView } from "./views";

const circlegraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log);
    rebind(TYPES.IModelFactory).to(SGraphFactory).inSingletonScope();
    bind<SModelElementRegistration>(TYPES.SModelElementRegistration).toConstantValue({
        type: 'node:circle',
        constr: CircularNode
    });
});

export default (useWebsocket: boolean) => {
    const container = new Container();
    container.load(defaultModule, selectModule, moveModule, boundsModule, undoRedoModule, viewportModule, exportModule, circlegraphModule);
    if (useWebsocket)
        container.bind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope();
    else
        container.bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope();
    overrideViewerOptions(container, {
        needsClientLayout: false
    });

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry);
    viewRegistry.register('graph', SGraphView);
    viewRegistry.register('node:circle', CircleNodeView);
    viewRegistry.register('edge:straight', PolylineEdgeView);

    return container;
};
