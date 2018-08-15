/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify";
import {
    defaultModule, TYPES, configureViewerOptions, ConsoleLogger, LogLevel, WebSocketDiagramServer,
    boundsModule, moveModule, fadeModule, hoverModule, viewportModule, selectModule, SGraphView, LocalModelSource,
    HtmlRootView, PreRenderedView, exportModule, SvgExporter, PreRenderedElement, SGraphFactory, SGraph,
    HtmlRoot, configureModelElement, SEdge
} from "../../../src";
import { TaskNodeView, BarrierNodeView, FlowEdgeView } from "./views";
import { TaskNode, BarrierNode } from "./flowmodel";

class FilteringSvgExporter extends SvgExporter {
    isExported(styleSheet: CSSStyleSheet): boolean {
        return styleSheet.href !== null && (
            styleSheet.href.endsWith('diagram.css')
            || styleSheet.href.endsWith('sprotty.css')
            || styleSheet.href.endsWith('page.css')
        );
    }
}

export default (useWebsocket: boolean) => {
    const flowModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        if (useWebsocket)
            bind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope();
        else
            bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope();
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.log);
        rebind(TYPES.IModelFactory).to(SGraphFactory).inSingletonScope();
        rebind(TYPES.SvgExporter).to(FilteringSvgExporter).inSingletonScope();
        const context = { bind, unbind, isBound, rebind };
        configureModelElement(context, 'flow', SGraph, SGraphView);
        configureModelElement(context, 'task', TaskNode, TaskNodeView);
        configureModelElement(context, 'barrier', BarrierNode, BarrierNodeView);
        configureModelElement(context, 'edge', SEdge, FlowEdgeView);
        configureModelElement(context, 'html', HtmlRoot, HtmlRootView);
        configureModelElement(context, 'pre-rendered', PreRenderedElement, PreRenderedView);
        configureViewerOptions(context, {
            baseDiv: 'sprotty-flow',
            hiddenDiv: 'sprotty-hidden-flow',
            popupDiv: 'sprotty-popup-flow',
            needsClientLayout: false,
            needsServerLayout: true
        });
    });

    const container = new Container();
    container.load(defaultModule, selectModule, moveModule, boundsModule, fadeModule, viewportModule, exportModule, hoverModule, flowModule);
    return container;
};
