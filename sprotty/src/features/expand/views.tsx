/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

 /** @jsx svg */
import { svg } from 'snabbdom-jsx';

import { VNode } from 'snabbdom/vnode';
import { IView, RenderingContext } from '../../base/views/view';
import { isExpandable } from './model';
import { findParentByFeature } from '../../base/model/smodel-utils';
import { SButton } from '../button/model';

export class ExpandButtonView implements IView {
    render(button: SButton, context: RenderingContext): VNode {
        const expandable = findParentByFeature(button, isExpandable);
        const path = (expandable !== undefined && expandable.expanded)
            ? 'M 1,5 L 8,12 L 15,5 Z'
            : 'M 1,8 L 8,15 L 8,1 Z';
        return <g class-sprotty-button="{true}" class-enabled="{button.enabled}">
                <rect x={0} y={0} width={16} height={16} opacity={0}></rect>
                <path d={path}></path>
            </g>;
    }
}
