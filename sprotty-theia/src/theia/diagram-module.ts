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

import { ContainerModule } from 'inversify'
import { DiagramWidgetRegistry } from "./diagram-widget-registry"
import { DiagramConfigurationRegistry } from "./diagram-configuration"
import { TheiaFileSaver } from "../sprotty/theia-file-saver"
import { DiagramCommandContribution, DiagramMenuContribution } from './diagram-commands'
import { CommandContribution, MenuContribution } from '@theia/core/lib/common'
import { DiagramKeybindingContext, DiagramKeybindingContribution } from './diagram-keybinding'
import { KeybindingContext, KeybindingContribution } from '@theia/core/lib/browser';

export default new ContainerModule(bind => {
    bind(DiagramWidgetRegistry).toSelf().inSingletonScope()
    bind(DiagramConfigurationRegistry).toSelf().inSingletonScope()
    bind(TheiaFileSaver).toSelf().inSingletonScope()
    bind(CommandContribution).to(DiagramCommandContribution).inSingletonScope()
    bind(MenuContribution).to(DiagramMenuContribution).inSingletonScope()
    bind(DiagramKeybindingContext).toSelf().inSingletonScope()
    bind(KeybindingContext).to(DiagramKeybindingContext).inSingletonScope()
    bind(KeybindingContribution).to(DiagramKeybindingContribution).inSingletonScope()
})
