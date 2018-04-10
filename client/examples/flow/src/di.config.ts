/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify";
import {
    defaultModule, TYPES, ViewRegistry, overrideViewerOptions, ConsoleLogger, LogLevel, WebSocketDiagramServer,
    boundsModule, moveModule, fadeModule, hoverModule, viewportModule, selectModule, SGraphView, LocalModelSource,
    HtmlRootView, PreRenderedView, exportModule, SvgExporter, SModelElementRegistration, PreRenderedElement,
    SGraphFactory, SGraph, HtmlRoot
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

const flowModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log);
    rebind(TYPES.IModelFactory).to(SGraphFactory).inSingletonScope();
    rebind(TYPES.SvgExporter).to(FilteringSvgExporter).inSingletonScope();
    bind<SModelElementRegistration>(TYPES.SModelElementRegistration).toConstantValue({
        type: 'task',
        constr: TaskNode
    });
    bind<SModelElementRegistration>(TYPES.SModelElementRegistration).toConstantValue({
        type: 'barrier',
        constr: BarrierNode
    });
    bind<SModelElementRegistration>(TYPES.SModelElementRegistration).toConstantValue({
        type: 'pre-rendered',
        constr: PreRenderedElement
    });
    bind<SModelElementRegistration>(TYPES.SModelElementRegistration).toConstantValue({
        type: 'flow',
        constr: SGraph
    });
    bind<SModelElementRegistration>(TYPES.SModelElementRegistration).toConstantValue({
        type: 'html',
        constr: HtmlRoot
    });
});

export default (useWebsocket: boolean) => {
    const container = new Container();
    container.load(defaultModule, selectModule, moveModule, boundsModule, fadeModule, viewportModule, exportModule, hoverModule, flowModule);
    if (useWebsocket)
        container.bind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope();
    else
        container.bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope();
    overrideViewerOptions(container, {
        baseDiv: 'sprotty-flow',
        hiddenDiv: 'sprotty-hidden-flow',
        popupDiv: 'sprotty-popup-flow',
        needsClientLayout: false,
        needsServerLayout: true
    });

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry);
    viewRegistry.register('flow', SGraphView);
    viewRegistry.register('task', TaskNodeView);
    viewRegistry.register('barrier', BarrierNodeView);
    viewRegistry.register('edge', FlowEdgeView);
    viewRegistry.register('html', HtmlRootView);
    viewRegistry.register('pre-rendered', PreRenderedView);

    return container;
};
