/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Action } from "../../base/actions/action";
import { SModelElement } from "../../base/model/smodel";
import { MouseListener } from "../../base/views/mouse-tool";
import { SLabel } from "../../graph/sgraph";

export const editLabelFeature = Symbol('labelEditFeature');

export interface EditableLabel {
}

export function isEditableLabel<T extends SModelElement>(element: T): element is T & EditableLabel {
    return element instanceof SLabel && element.hasFeature(editLabelFeature);
}

export class EditLabelAction implements Action {
    static KIND = 'EditLabel';
    kind = EditLabelAction.KIND;
    constructor(readonly labelId: string) {}
}

export class EditLabelMouseListener extends MouseListener {
    doubleClick(target: SModelElement, event: WheelEvent): (Action | Promise<Action>)[] {
        if (target instanceof SLabel && isEditableLabel(target)) {
            return [new EditLabelAction(target.id)];
        }
        return [];
    }
}
