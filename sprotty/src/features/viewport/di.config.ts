/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify";
import { TYPES } from "../../base/types";
import { CenterCommand, CenterKeyboardListener, FitToScreenCommand } from "./center-fit";
import { ViewportCommand } from "./viewport";
import { ScrollMouseListener } from "./scroll";
import { ZoomMouseListener } from "./zoom";

const viewportModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(CenterCommand);
    bind(TYPES.ICommand).toConstructor(FitToScreenCommand);
    bind(TYPES.ICommand).toConstructor(ViewportCommand);
    bind(TYPES.KeyListener).to(CenterKeyboardListener);
    bind(TYPES.MouseListener).to(ScrollMouseListener);
    bind(TYPES.MouseListener).to(ZoomMouseListener);
});

export default viewportModule;
