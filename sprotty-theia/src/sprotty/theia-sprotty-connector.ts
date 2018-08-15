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

import { ActionMessage, ExportSvgAction, ServerStatusAction } from 'sprotty/lib'
import { TheiaDiagramServer } from './theia-diagram-server'
import { NotificationType } from 'vscode-jsonrpc/lib/messages'
import { Location } from 'vscode-languageserver-types'
import { LanguageClientContribution } from '@theia/languages/lib/browser'
import { EditorManager } from '@theia/editor/lib/browser'
import { TheiaFileSaver } from './theia-file-saver'
import { DiagramWidgetRegistry } from '../theia/diagram-widget-registry'
import URI from "@theia/core/lib/common/uri"

export interface OpenInTextEditorMessage {
    location: Location
    forceOpen: boolean
}

const acceptMessageType = new NotificationType<ActionMessage, void>('diagram/accept')
const didCloseMessageType = new NotificationType<string, void>('diagram/didClose')
const openInTextEditorMessageType = new NotificationType<OpenInTextEditorMessage, void>('diagram/openInTextEditor')

/**
 * Connects sprotty DiagramServers to a Theia LanguageClientContribution.
 *
 * Used to tunnel sprotty actions to and from the sprotty server through
 * the LSP.
 *
 * Instances bridge the gap between the sprotty DI containers (one per
 * diagram) and a specific language client from the Theia DI container
 * (one per application).
 */
export class TheiaSprottyConnector {

    private servers: TheiaDiagramServer[] = []

    constructor(private languageClientContribution: LanguageClientContribution,
                private fileSaver: TheiaFileSaver,
                private editorManager: EditorManager,
                private diagramWidgetRegistry: DiagramWidgetRegistry) {
        this.languageClientContribution.languageClient.then(
            lc => {
                lc.onNotification(acceptMessageType, this.receivedThroughLsp.bind(this))
                lc.onNotification(openInTextEditorMessageType, this.openInTextEditor.bind(this))
            }
        ).catch(
            err => console.error(err)
        )
    }

    connect(diagramServer: TheiaDiagramServer) {
        this.servers.push(diagramServer)
        diagramServer.connect(this)
    }

    disconnect(diagramServer: TheiaDiagramServer) {
        const index = this.servers.indexOf(diagramServer)
        if (index >= 0)
            this.servers.splice(index, 0)
        diagramServer.disconnect()
        this.languageClientContribution.languageClient.then(lc => lc.sendNotification(didCloseMessageType, diagramServer.clientId))
    }

    save(uri: string, action: ExportSvgAction) {
        this.fileSaver.save(uri, action)
    }

    openInTextEditor(message: OpenInTextEditorMessage) {
        const uri = new URI(message.location.uri)
        if (!message.forceOpen) {
            this.editorManager.all.forEach(editorWidget => {
                const currentTextEditor = editorWidget.editor
                if (editorWidget.isVisible && uri.toString() === currentTextEditor.uri.toString()) {
                    currentTextEditor.cursor = message.location.range.start
                    currentTextEditor.revealRange(message.location.range)
                    currentTextEditor.selection = message.location.range
                }
            })
        } else {
            this.editorManager.open(uri).then(
                editorWidget => {
                    const editor = editorWidget.editor
                    editor.cursor = message.location.range.start
                    editor.revealRange(message.location.range)
                    editor.selection = message.location.range
                })
        }
    }

    showStatus(widgetId: string, status: ServerStatusAction): void {
        const widget = this.diagramWidgetRegistry.getWidgetById(widgetId)
        if (widget)
            widget.setStatus(status)
    }

    sendThroughLsp(message: ActionMessage) {
        this.languageClientContribution.languageClient.then(lc => lc.sendNotification(acceptMessageType, message))
    }

    receivedThroughLsp(message: ActionMessage) {
        this.servers.forEach(element => {
            element.messageReceived(message)
        })
    }
}
