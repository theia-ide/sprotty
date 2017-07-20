/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Bounds, EMPTY_BOUNDS, isValidDimension } from "../../utils/geometry"
import { SParentElement, SModelElement, SChildElement } from "../../base/model/smodel"
import { isLayouting, Layouting, isBoundsAware } from "./model"
import { ILayout, StatefulLayouter } from './layout'

export abstract class AbstractLayout implements ILayout {

    abstract layout(container: SParentElement & Layouting,
           layouter: StatefulLayouter): void

    protected getFixedContainerBounds(
            container: SModelElement,
            layoutOptions: any,
            layouter: StatefulLayouter): Bounds {
        let currentContainer = container
        while (true) {
            if (isBoundsAware(currentContainer)) {
                const bounds = currentContainer.bounds
                if (isLayouting(currentContainer) && layoutOptions.resizeContainer)
                    layouter.log.error(currentContainer, 'Resizable container found while detecting fixed bounds')
                if (isValidDimension(bounds))
                    return bounds
            }
            if (currentContainer instanceof SChildElement) {
                currentContainer = currentContainer.parent
            } else {
                layouter.log.error(currentContainer, 'Cannot detect fixed bounds')
                return EMPTY_BOUNDS
            }
        }
    }
}