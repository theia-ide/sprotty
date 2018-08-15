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

import {
    ILogger, SelectCommand, ActionHandlerRegistry, IActionDispatcher, SModelStorage, TYPES,
    ViewerOptions, DiagramServer, ActionMessage, ExportSvgAction, RequestModelAction, Action,
    ICommand, ServerStatusAction
} from 'sprotty/lib'
import { TheiaSprottyConnector } from './theia-sprotty-connector'
import { injectable, inject } from "inversify"

/**
 * A sprotty DiagramServer that can be connected to a Theia language
 * server.
 *
 * This class is the sprotty side of the Theia/sprotty integration. It
 * is instantiated with the DI container of the sprotty diagram. Theia
 * services are available via the TheiaDiagramServerConnector.
 */
@injectable()
export class TheiaDiagramServer extends DiagramServer {

    protected connector: Promise<TheiaSprottyConnector>
    private resolveConnector: (server: TheiaSprottyConnector) => void
    private sourceUri: string

    constructor(@inject(TYPES.IActionDispatcher) public actionDispatcher: IActionDispatcher,
                @inject(TYPES.ActionHandlerRegistry) actionHandlerRegistry: ActionHandlerRegistry,
                @inject(TYPES.ViewerOptions) viewerOptions: ViewerOptions,
                @inject(TYPES.SModelStorage) storage: SModelStorage,
                @inject(TYPES.ILogger) logger: ILogger) {
        super(actionDispatcher, actionHandlerRegistry, viewerOptions, storage, logger)
        this.waitForConnector()
    }

    connect(connector: TheiaSprottyConnector): void {
        this.resolveConnector(connector)
    }

    disconnect(): void {
        this.waitForConnector()
    }

    private waitForConnector(): void {
        this.connector = new Promise<TheiaSprottyConnector>(resolve =>
            this.resolveConnector = resolve)
    }

    initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry)
        registry.register(SelectCommand.KIND, this)
    }

    handle(action: Action): void | ICommand {
        if (action instanceof RequestModelAction && action.options !== undefined)
            this.sourceUri = action.options.sourceUri
        return super.handle(action)
    }

    handleExportSvgAction(action: ExportSvgAction): boolean {
        this.connector.then(c => c.save(this.sourceUri, action))
        return true
    }

    protected handleServerStateAction(status: ServerStatusAction): boolean {
        this.connector.then(c => c.showStatus(this.clientId, status))
        return false
    }

    sendMessage(message: ActionMessage) {
        this.connector.then(c => c.sendThroughLsp(message))
    }

    /**
     * made public
     */
    messageReceived(message: ActionMessage) {
        super.messageReceived(message)
    }
}
