/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify";
import {
    defaultModule, TYPES, configureViewerOptions, SGraphView, SLabelView, ConsoleLogger,
    LogLevel, WebSocketDiagramServer, boundsModule, moveModule, selectModule, undoRedoModule,
    viewportModule, hoverModule, LocalModelSource, HtmlRootView, PreRenderedView, exportModule,
    expandModule, fadeModule, buttonModule, SGraphFactory, PreRenderedElement, SNode, SLabel,
    HtmlRoot, configureModelElement
} from "../../../src";
import { MindmapNodeView, PopupButtonView } from "./views";
import { popupModelFactory, PopupButtonMouseListener, AddElementCommand } from "./popup";
import { Mindmap, PopupButton } from "./model";

export default (useWebsocket: boolean, containerId: string) => {
    const mindmapModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        if (useWebsocket)
            bind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope();
        else
            bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope();
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.log);
        rebind(TYPES.IModelFactory).to(SGraphFactory).inSingletonScope();
        bind(TYPES.PopupModelFactory).toConstantValue(popupModelFactory);
        bind(TYPES.PopupMouseListener).to(PopupButtonMouseListener);
        bind(TYPES.ICommand).toConstructor(AddElementCommand);
        const context = { bind, unbind, isBound, rebind };
        configureModelElement(container, 'mindmap', Mindmap, SGraphView);
        configureModelElement(container, 'node', SNode, MindmapNodeView);
        configureModelElement(container, 'label', SLabel, SLabelView);
        configureModelElement(container, 'html', HtmlRoot, HtmlRootView);
        configureModelElement(container, 'pre-rendered', PreRenderedElement, PreRenderedView);
        configureModelElement(container, 'popup:button', PopupButton, PopupButtonView);
        configureViewerOptions(context, {
            needsClientLayout: false,
            baseDiv: containerId,
            popupOpenDelay: 500
        });
    });

    const container = new Container();
    container.load(defaultModule, selectModule, moveModule, boundsModule, undoRedoModule,
        viewportModule, fadeModule, hoverModule, exportModule, expandModule, buttonModule,
        mindmapModule);
    return container;
};
