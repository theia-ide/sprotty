/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify";
import {
    defaultModule, TYPES, configureViewerOptions, SGraphFactory, SGraphView, PolylineEdgeView, ConsoleLogger,
    LogLevel, WebSocketDiagramServer, boundsModule, moveModule, selectModule, undoRedoModule, viewportModule,
    LocalModelSource, exportModule, CircularNode, configureModelElement, SGraph, SEdge
} from "../../../src";
import { CircleNodeView } from "./views";

export default (useWebsocket: boolean) => {
    const circlegraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        if (useWebsocket)
            bind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope();
        else
            bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope();
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.log);
        rebind(TYPES.IModelFactory).to(SGraphFactory).inSingletonScope();
        const context = { bind, unbind, isBound, rebind };
        configureModelElement(context, 'graph', SGraph, SGraphView);
        configureModelElement(context, 'node:circle', CircularNode, CircleNodeView);
        configureModelElement(context, 'edge:straight', SEdge, PolylineEdgeView);
        configureViewerOptions(context, {
            needsClientLayout: false
        });
    });

    const container = new Container();
    container.load(defaultModule, selectModule, moveModule, boundsModule, undoRedoModule, viewportModule, exportModule, circlegraphModule);
    return container;
};
