/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { MouseListener } from '../../base/views/mouse-tool';
import { Action } from '../../base/actions/action';
import { SModelElement } from '../../base/model/smodel';
import { findParentByFeature } from '../../base/model/smodel-utils';
import { isOpenable } from './model';

export class OpenAction {
    static KIND = 'open';
    kind = OpenAction.KIND;
    constructor(public readonly elementId: string) {}
}

export class OpenMouseListener extends MouseListener {
    doubleClick(target: SModelElement, event: WheelEvent): (Action | Promise<Action>)[] {
        const openableTarget = findParentByFeature(target, isOpenable);
        if (openableTarget !== undefined) {
            return [ new OpenAction(openableTarget.id) ];
        }
        return [];
    }
}
