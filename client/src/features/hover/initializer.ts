/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";
import { ActionHandlerRegistry, IActionHandler, IActionHandlerInitializer } from "../../base/actions/action-handler";
import { Action } from "../../base/actions/action";
import { ICommand } from "../../base/commands/command";
import { SetPopupModelAction, SetPopupModelCommand } from "./hover";
import { EMPTY_ROOT } from "../../base/model/smodel-factory";
import { CenterCommand, FitToScreenCommand } from "../viewport/center-fit";
import { ViewportCommand } from "../viewport/viewport";
import { MoveCommand } from "../move/move";

class ClosePopupActionHandler implements IActionHandler {
    protected popupOpen: boolean = false;

    handle(action: Action): void | ICommand | Action {
        if (action.kind === SetPopupModelCommand.KIND) {
            this.popupOpen = (action as SetPopupModelAction).newRoot.type !== EMPTY_ROOT.type;
        } else if (this.popupOpen) {
            return new SetPopupModelAction({id: EMPTY_ROOT.id, type: EMPTY_ROOT.type});
        }
    }
}

@injectable()
export class PopupActionHandlerInitializer implements IActionHandlerInitializer {
    initialize(registry: ActionHandlerRegistry): void {
        const closePopupActionHandler = new ClosePopupActionHandler();
        registry.register(FitToScreenCommand.KIND, closePopupActionHandler);
        registry.register(CenterCommand.KIND, closePopupActionHandler);
        registry.register(ViewportCommand.KIND, closePopupActionHandler);
        registry.register(SetPopupModelCommand.KIND, closePopupActionHandler);
        registry.register(MoveCommand.KIND, closePopupActionHandler);
    }

}
