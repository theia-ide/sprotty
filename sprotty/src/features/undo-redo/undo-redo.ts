/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { matchesKeystroke } from "../../utils/keyboard";
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
        if (matchesKeystroke(event, 'KeyZ', 'ctrlCmd'))
            return [new UndoAction];
        if (matchesKeystroke(event, 'KeyZ', 'ctrlCmd', 'shift'))
            return [new RedoAction];
        return [];
    }
}
