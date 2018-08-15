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

import { DiagramCommands } from './diagram-commands'
import { DiagramWidget } from './diagram-widget'
import { injectable, inject } from 'inversify'
import { FrontendApplication } from '@theia/core/lib/browser/frontend-application'
import { CommonCommands, KeybindingContext, Keybinding, KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser'

@injectable()
export class DiagramKeybindingContext implements KeybindingContext {

    constructor(@inject(FrontendApplication) protected readonly application: FrontendApplication) {
    }

    id = 'diagram.keybinding.context'

    isEnabled(arg?: Keybinding) {
        return this.application.shell.currentWidget instanceof DiagramWidget
    }
}

@injectable()
export class DiagramKeybindingContribution implements KeybindingContribution {

    constructor(@inject(DiagramKeybindingContext) protected readonly diagramKeybindingContext: DiagramKeybindingContext) { }

    registerKeybindings(registry: KeybindingRegistry): void {
        [
            {
                command: DiagramCommands.CENTER,
                context: this.diagramKeybindingContext.id,
                keybinding: 'alt+c'
            },
            {
                command: DiagramCommands.FIT,
                context: this.diagramKeybindingContext.id,
                keybinding: 'alt+f'
            },
            {
                command: DiagramCommands.EXPORT,
                context: this.diagramKeybindingContext.id,
                keybinding: 'alt+e'
            },
            {
                command: DiagramCommands.SELECT_ALL,
                context: this.diagramKeybindingContext.id,
                keybinding: 'ctrlcmd+a'
            },
            {
                command: CommonCommands.UNDO.id,
                context: this.diagramKeybindingContext.id,
                keybinding: 'ctrlcmd+z'
            },
            {
                command: CommonCommands.REDO.id,
                context: this.diagramKeybindingContext.id,
                keybinding: 'ctrlcmd+shift+z'
            }
        ].forEach(binding => {
            registry.registerKeybinding(binding)
        })
    }
}
