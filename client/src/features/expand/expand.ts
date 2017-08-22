/*
* Copyright (C) 2017 TypeFox and others.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

import { MouseListener } from '../../base/views/mouse-tool'
import { Action } from '../../base/actions/action'
import { SModelElement } from '../../base/model/smodel'
import { findParentByFeature } from '../../base/model/smodel-utils'
import { isExpandable } from './model'

export class CollapseExpandAction {
    static KIND = 'collapseExpand'
    kind = CollapseExpandAction.KIND
    constructor(public readonly expandIds: string[],
                public readonly collapseIds: string[]) {}
}

export class ExpandMouseListener extends MouseListener {
    doubleClick(target: SModelElement, event: WheelEvent): (Action | Promise<Action>)[] {
        const expandableTarget = findParentByFeature(target, isExpandable)
        if (expandableTarget !== undefined) {
            return [ new CollapseExpandAction(
                expandableTarget.expanded ? [] : [ expandableTarget.id ],
                expandableTarget.expanded ? [ expandableTarget.id ] : []) ]
        }
        return []
    }
}