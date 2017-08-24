/*
* Copyright (C) 2017 TypeFox and others.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

import { Action } from '../../base/actions/action'
import { SButton } from '../../graph/sgraph'
import { findParentByFeature } from '../../base/model/smodel-utils'
import { isExpandable } from './model'
import { IButtonHandler } from '../select/button-handler'
import { injectable } from 'inversify'

export class CollapseExpandAction {
    static KIND = 'collapseExpand'
    kind = CollapseExpandAction.KIND
    constructor(public readonly expandIds: string[],
                public readonly collapseIds: string[]) {}
}

@injectable()
export class ExpandButtonHandler implements IButtonHandler {
    static TYPE = 'button:expand'

    buttonPressed(button: SButton): Action[] {
        const expandable = findParentByFeature(button, isExpandable)
        if (expandable !== undefined) {
            return [ new CollapseExpandAction(
                expandable.expanded ? [] : [ expandable.id ],
                expandable.expanded ? [ expandable.id ] : []) ]
        } else {
            return []
        }
    }
}
