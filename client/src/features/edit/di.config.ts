/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify";
import { TYPES } from "../../base/types";
import { SwitchEditModeCommand, MoveRoutingHandleCommand } from "./edit-routing";
import { ReconnectCommand } from "./reconnect";
import { configureModelElement } from "../../base/views/view";
import { SDanglingAnchor } from "../../graph/sgraph";
import { EmptyGroupView } from "../../lib/svg-views";
import { DeleteElementCommand } from "./delete";
import { EditLabelMouseListener } from "./edit-label";

export const edgeEditModule = new ContainerModule(bind => {
    bind(TYPES.ICommand).toConstructor(SwitchEditModeCommand);
    bind(TYPES.ICommand).toConstructor(MoveRoutingHandleCommand);
    bind(TYPES.ICommand).toConstructor(ReconnectCommand);
    bind(TYPES.ICommand).toConstructor(DeleteElementCommand);
    configureModelElement({bind}, 'dangling-anchor', SDanglingAnchor, EmptyGroupView);
});

export const labelEditModule = new ContainerModule(bind => {
    bind(TYPES.MouseListener).to(EditLabelMouseListener);
});
