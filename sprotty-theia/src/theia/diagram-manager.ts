/********************************************************************************
 * Copyright (c) 2017-2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { TheiaDiagramServer } from '../sprotty/theia-diagram-server';
import { TheiaSprottyConnector } from '../sprotty/theia-sprotty-connector'
import { DiagramConfigurationRegistry } from './diagram-configuration'
import { injectable, inject } from "inversify"
import { OpenerOptions, OpenHandler, FrontendApplicationContribution, ApplicationShell } from "@theia/core/lib/browser"
import URI from "@theia/core/lib/common/uri"
import { DiagramWidget, DiagramWidgetFactory } from "./diagram-widget"
import { DiagramWidgetRegistry } from "./diagram-widget-registry"
import { Emitter, Event, SelectionService } from '@theia/core/lib/common'
import { TYPES, ModelSource, IActionDispatcher, DiagramServer } from 'sprotty/lib'
import { EditorManager } from '@theia/editor/lib/browser';

export const DiagramManagerProvider = Symbol('DiagramManagerProvider')

export type DiagramManagerProvider = () => Promise<DiagramManager>

export interface DiagramManager extends OpenHandler, FrontendApplicationContribution {
    readonly diagramType: string
    readonly onDiagramOpened: Event<URI>
}

@injectable()
export abstract class DiagramManagerImpl implements DiagramManager {

    @inject(ApplicationShell) protected readonly shell: ApplicationShell
    @inject(DiagramWidgetRegistry) protected readonly widgetRegistry: DiagramWidgetRegistry
    @inject(SelectionService) protected readonly selectionService: SelectionService
    @inject(DiagramConfigurationRegistry) protected diagramConfigurationRegistry: DiagramConfigurationRegistry
    @inject(EditorManager) protected editorManager: EditorManager

    protected readonly onDiagramOpenedEmitter = new Emitter<URI>()

    abstract get diagramType(): string
    abstract iconClass: string

    get id() {
        return this.diagramType + "-diagram-opener"
    }

    get onDiagramOpened(): Event<URI> {
        return this.onDiagramOpenedEmitter.event
    }

    canHandle(uri: URI, options?: OpenerOptions | undefined): number {
        return 10
    }

    open(uri: URI, input?: OpenerOptions): Promise<DiagramWidget> {
        const promiseDiagramWidget = this.getOrCreateDiagramWidget(uri)
        promiseDiagramWidget.then(diagramWidget => {
            window.requestAnimationFrame(() => {
                this.shell.activateWidget(diagramWidget.id)
                this.onDiagramOpenedEmitter.fire(uri)
            })
        })
        return promiseDiagramWidget
    }

    protected getOrCreateDiagramWidget(uri: URI): Promise<DiagramWidget> {
        const widget = this.widgetRegistry.getWidget(uri, this.diagramType)
        if (widget !== undefined)
            return widget
        const newWidget = this.createDiagramWidget(uri)
        this.addToShell(newWidget)
        return Promise.resolve(newWidget)
    }

    protected createDiagramWidget(uri: URI): DiagramWidget {
        const widgetId = this.widgetRegistry.nextId()
        const svgContainerId = widgetId + '_sprotty'
        const diagramConfiguration = this.diagramConfigurationRegistry.get(this.diagramType)
        const diContainer = diagramConfiguration.createContainer(svgContainerId)
        const modelSource = diContainer.get<ModelSource>(TYPES.ModelSource)
        if (modelSource instanceof DiagramServer)
            modelSource.clientId = widgetId
        if (modelSource instanceof TheiaDiagramServer && this.diagramConnector)
            this.diagramConnector.connect(modelSource)
        const newWidget = this.diagramWidgetFactory({
            id: widgetId, svgContainerId, uri, diagramType: this.diagramType, modelSource,
            actionDispatcher: diContainer.get<IActionDispatcher>(TYPES.IActionDispatcher)
        })
        newWidget.title.closable = true
        newWidget.title.label = uri.path.base
        newWidget.title.icon = this.iconClass
        this.widgetRegistry.addWidget(uri, this.diagramType, newWidget)
        newWidget.disposed.connect(() => {
            this.widgetRegistry.removeWidget(uri, this.diagramType)
            if (modelSource instanceof TheiaDiagramServer && this.diagramConnector)
                this.diagramConnector.disconnect(modelSource)
        })
        return newWidget
    }

    protected addToShell(widget: DiagramWidget): void {
        const currentEditor = this.editorManager.currentEditor
        const options: ApplicationShell.WidgetOptions = {
            area: 'main'
        }
        if (!!currentEditor && currentEditor.editor.uri.toString === widget.uri.toString) {
            options.ref = currentEditor
            options.mode = 'split-right'
        }
        this.shell.addWidget(widget, options)
    }

    protected get diagramWidgetFactory(): DiagramWidgetFactory {
        return options => new DiagramWidget(options)
    }

    get diagramConnector(): TheiaSprottyConnector | undefined {
        return undefined
    }
}
