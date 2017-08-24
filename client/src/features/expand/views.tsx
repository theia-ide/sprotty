/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import * as snabbdom from "snabbdom-jsx"
import { VNode } from 'snabbdom/vnode'
import { IView, RenderingContext } from '../../base/views/view'
import { isExpandable } from './model'
import { findParentByFeature } from '../../base/model/smodel-utils'
import { SButton } from '../../graph/sgraph'

const JSX = {createElement: snabbdom.svg}

export class ExpandButtonView implements IView {
    render(button: SButton, context: RenderingContext): VNode {
        const expandable = findParentByFeature(button, isExpandable)
        const path = (expandable !== undefined && expandable.expanded)
            ? 'M 0,0 L 7,7 L 14,0 Z'
            : 'M 0,7 L 7,14 L 7,0 Z'
        return <g class-button="{true}" class-enabled="{button.enabled}">
                <path d={path}></path>
            </g>
    }
}

