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

import { RequestModelAction, CenterAction, InitializeCanvasBoundsAction, ModelSource, ServerStatusAction, IActionDispatcher } from 'sprotty/lib';
import { Widget } from "@phosphor/widgets"
import { Message } from "@phosphor/messaging/lib"
import URI from "@theia/core/lib/common/uri"
import { BaseWidget } from '@theia/core/lib/browser/widgets/widget'

export interface DiagramWidgetOptions {
    id: string
    svgContainerId: string
    uri: URI
    diagramType: string
    modelSource: ModelSource
    actionDispatcher: IActionDispatcher
}

export type DiagramWidgetFactory = (options: DiagramWidgetOptions) => DiagramWidget
export const DiagramWidgetFactory = Symbol('DiagramWidgetFactory')

export class DiagramWidget extends BaseWidget {

    private statusIconDiv: HTMLDivElement
    private statusMessageDiv: HTMLDivElement

    public readonly id: string
    public readonly svgContainerId: string
    public readonly uri: URI
    public readonly diagramType: string
    public readonly modelSource: ModelSource
    public readonly actionDispatcher: IActionDispatcher

    constructor(options: DiagramWidgetOptions) {
        super()
        this.id = options.id
        this.svgContainerId = options.svgContainerId
        this.uri = options.uri
        this.diagramType = options.diagramType
        this.modelSource = options.modelSource
        this.actionDispatcher = options.actionDispatcher
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg)
        const svgContainer = document.createElement("div")
        svgContainer.id = this.svgContainerId
        this.node.appendChild(svgContainer)

        const statusDiv = document.createElement("div")
        statusDiv.setAttribute('class', 'sprotty-status')
        this.node.appendChild(statusDiv)

        this.statusIconDiv = document.createElement("div")
        this.statusIconDiv.setAttribute('class', 'fa')
        statusDiv.appendChild(this.statusIconDiv)

        this.statusMessageDiv = document.createElement("div")
        this.statusMessageDiv.setAttribute('class', 'sprotty-status-message')
        statusDiv.appendChild(this.statusMessageDiv)

        this.modelSource.handle(new RequestModelAction({
            sourceUri: this.uri.toString(),
            diagramType: this.diagramType
        }))
    }

    protected getBoundsInPage(element: Element) {
        const bounds = element.getBoundingClientRect()
        return {
            x: bounds.left,
            y: bounds.top,
            width: bounds.width,
            height: bounds.height
        }
    }

    protected onResize(msg: Widget.ResizeMessage): void {
        super.onResize(msg)
        const newBounds = this.getBoundsInPage(this.node as Element)
        this.actionDispatcher.dispatch(new InitializeCanvasBoundsAction(newBounds))
        this.actionDispatcher.dispatch(new CenterAction([], false))
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg)
        const svgElement = this.node.querySelector(`#${this.svgContainerId} svg`) as HTMLElement
        if (svgElement !== null)
            svgElement.focus()
    }

    setStatus(status: ServerStatusAction): void {
        this.statusMessageDiv.textContent = status.message
        this.removeClasses(this.statusMessageDiv, 1)
        this.statusMessageDiv.classList.add(status.severity.toLowerCase())
        this.removeClasses(this.statusIconDiv, 1)
        const classes = this.statusIconDiv.classList
        classes.add(status.severity.toLowerCase())
        switch (status.severity) {
            case 'ERROR': classes.add('fa-exclamation-circle')
                break
            case 'WARNING': classes.add('fa-warning')
                break
            case 'INFO': classes.add('fa-info-circle')
                break
        }
    }

    protected removeClasses(element: Element, keep: number) {
        const classes = element.classList
        while (classes.length > keep) {
            const item = classes.item(classes.length - 1)
            if (item)
                classes.remove(item)
        }
    }
}