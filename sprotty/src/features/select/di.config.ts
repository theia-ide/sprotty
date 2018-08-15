/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify";
import { TYPES } from "../../base/types";
import { SelectCommand, SelectAllCommand, SelectKeyboardListener, SelectMouseListener } from "./select";

const selectModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(SelectCommand);
    bind(TYPES.ICommand).toConstructor(SelectAllCommand);
    bind(TYPES.KeyListener).to(SelectKeyboardListener);
    bind(TYPES.MouseListener).to(SelectMouseListener);
});

export default selectModule;
