/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify";
import { TYPES } from "../../base/types";
import {
    HoverMouseListener, PopupHoverMouseListener, HoverFeedbackCommand, SetPopupModelCommand, HoverKeyListener, HoverState
} from "./hover";
import { PopupPositionUpdater } from "./popup-position-updater";
import { PopupActionHandlerInitializer } from "./initializer";

const hoverModule = new ContainerModule(bind => {
    bind(TYPES.PopupVNodeDecorator).to(PopupPositionUpdater).inSingletonScope();
    bind(TYPES.IActionHandlerInitializer).to(PopupActionHandlerInitializer);
    bind(TYPES.ICommand).toConstructor(HoverFeedbackCommand);
    bind(TYPES.ICommand).toConstructor(SetPopupModelCommand);
    bind(TYPES.MouseListener).to(HoverMouseListener);
    bind(TYPES.PopupMouseListener).to(PopupHoverMouseListener);
    bind(TYPES.KeyListener).to(HoverKeyListener);
    bind<HoverState>(TYPES.HoverState).toConstantValue({
        mouseOverTimer: undefined,
        mouseOutTimer: undefined,
        popupOpen: false,
        previousPopupElement: undefined
    });
});

export default hoverModule;
