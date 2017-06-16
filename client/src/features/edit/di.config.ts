/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify"
import { TYPES } from "../../base/types"
import { ActivateEditModeCommand, EditActivationDecorator } from "./edit"

const editModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(ActivateEditModeCommand)
    bind(TYPES.IVNodeDecorator).to(EditActivationDecorator).inSingletonScope()
})

export default editModule
