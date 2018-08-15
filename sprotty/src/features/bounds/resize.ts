/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Animation } from "../../base/animations/animation";
import { SModelRoot, SModelElement } from "../../base/model/smodel";
import { CommandExecutionContext } from "../../base/commands/command";
import { BoundsAware } from './model';
import { Dimension } from '../../utils/geometry';

export interface ResolvedElementResize {
    element: SModelElement & BoundsAware
    fromDimension: Dimension
    toDimension: Dimension
}

export class ResizeAnimation extends Animation {
    constructor(protected model: SModelRoot,
        public elementResizes: Map<string, ResolvedElementResize>,
        context: CommandExecutionContext,
        protected reverse: boolean = false) {
        super(context);
    }

    tween(t: number) {
        this.elementResizes.forEach(
            (elementResize) => {
                const element = elementResize.element;
                const newDimension: Dimension = (this.reverse) ? {
                        width: (1 - t) * elementResize.toDimension.width + t * elementResize.fromDimension.width,
                        height: (1 - t) * elementResize.toDimension.height + t * elementResize.fromDimension.height
                    } : {
                        width: (1 - t) * elementResize.fromDimension.width + t * elementResize.toDimension.width,
                        height: (1 - t) * elementResize.fromDimension.height + t * elementResize.toDimension.height
                    };
                element.bounds = {
                    x: element.bounds.x,
                    y: element.bounds.y,
                    width: newDimension.width,
                    height: newDimension.height
                };
            }
        );
        return this.model;
    }
}
