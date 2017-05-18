/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify"
import { IVNodeDecorator } from "../../base/view/vnode-decorators"
import { VNode } from "snabbdom/vnode"
import { SModelElement } from "../../base/model/smodel"
import { TYPES } from "../../base/types"
import { ViewerOptions } from "../../base/view/options"

@injectable()
export class PopupPositionUpdater implements IVNodeDecorator {

    constructor(@inject(TYPES.ViewerOptions) protected options: ViewerOptions) {

    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        return vnode
    }

    postUpdate(): void {
        let popupDiv = document.getElementById(this.options.popupDiv)
        if (popupDiv !== null && typeof window !== 'undefined') {
            const boundingClientRect = popupDiv.getBoundingClientRect()
            if (window.innerHeight < boundingClientRect.height + boundingClientRect.top) {
                popupDiv.style.top = (window.scrollY + window.innerHeight - boundingClientRect.height - 5) + 'px'
            }

            if (window.innerWidth < boundingClientRect.left + boundingClientRect.width) {
                popupDiv.style.left = (window.scrollX + window.innerWidth - boundingClientRect.width - 5) + 'px'
            }

            if (boundingClientRect.left < 0) {
                popupDiv.style.left = '0px'
            }

            if (boundingClientRect.top < 0) {
                popupDiv.style.top = '0px'
            }
        }
    }

}