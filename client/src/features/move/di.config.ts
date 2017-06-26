/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { MoveCommand, MoveEdgesCommand, MoveMouseListener } from "./move"
import { MoveActionHandlerInitializer } from "./initializer"

const moveModule = new ContainerModule(bind => {
    bind(TYPES.MouseListener).to(MoveMouseListener)
    bind(TYPES.IActionHandlerInitializer).to(MoveActionHandlerInitializer)
    bind(TYPES.ICommand).toConstructor(MoveCommand)
    bind(TYPES.ICommand).toConstructor(MoveEdgesCommand)
})

export default moveModule
