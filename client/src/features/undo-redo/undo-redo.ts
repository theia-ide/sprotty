/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { isCtrlOrCmd } from "../../utils/browser";
import { Action } from "../../base/actions/action";
import { KeyListener } from "../../base/views/key-tool";
import { SModelElement } from "../../base/model/smodel";

export class UndoAction implements Action {
    static readonly KIND = 'undo';
    kind = UndoAction.KIND;
}

export class RedoAction implements Action {
    static readonly KIND = 'redo';
    kind = RedoAction.KIND;
}

export class UndoRedoKeyListener extends KeyListener {
    keyDown(element: SModelElement, event: KeyboardEvent): Action[] {
        if (isCtrlOrCmd(event) && event.keyCode === 90) {
            if (event.shiftKey)
                return [new RedoAction];
            else
                return [new UndoAction];
        }
        return [];
    }
}
