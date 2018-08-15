/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify";
import {
    SCompartmentView, SLabelView, defaultModule, TYPES, ViewRegistry, configureViewerOptions,
    ConsoleLogger, LogLevel, WebSocketDiagramServer, boundsModule, selectModule, viewportModule,
    moveModule, fadeModule, hoverModule, LocalModelSource, HtmlRootView, PreRenderedView,
    exportModule, SvgExporter
} from '../../../src';
import { ChipModelFactory } from "./chipmodel-factory";
import { ProcessorView, CoreView, CrossbarView, ChannelView, SimpleCoreView } from "./views";

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
    const multicoreModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        if (useWebsocket)
            bind(TYPES.ModelSource).to(WebSocketDiagramServer).inSingletonScope();
        else
            bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope();
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.log);
        rebind(TYPES.IModelFactory).to(ChipModelFactory).inSingletonScope();
        rebind(TYPES.SvgExporter).to(FilteringSvgExporter).inSingletonScope();
        const context = { bind, unbind, isBound, rebind };
        configureViewerOptions(context, {
            baseDiv: 'sprotty-cores',
            hiddenDiv: 'sprotty-hidden-cores',
            popupDiv: 'sprotty-popup-cores',
            needsClientLayout: true,
            needsServerLayout: false
        });
    });

    const container = new Container();
    container.load(defaultModule, boundsModule, selectModule, moveModule, viewportModule, fadeModule,
        exportModule, hoverModule, multicoreModule);

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry);
    viewRegistry.register('processor', ProcessorView);
    viewRegistry.register('core', CoreView);
    viewRegistry.register('simplecore', SimpleCoreView);
    viewRegistry.register('crossbar', CrossbarView);
    viewRegistry.register('channel', ChannelView);
    viewRegistry.register('label:heading', SLabelView);
    viewRegistry.register('label:info', SLabelView);
    viewRegistry.register('comp', SCompartmentView);
    viewRegistry.register('html', HtmlRootView);
    viewRegistry.register('pre-rendered', PreRenderedView);

    return container;
};
