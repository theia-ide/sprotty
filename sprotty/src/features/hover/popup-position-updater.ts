/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify";
import { VNode } from "snabbdom/vnode";
import { TYPES } from "../../base/types";
import { IVNodeDecorator } from "../../base/views/vnode-decorators";
import { ViewerOptions } from "../../base/views/viewer-options";
import { SModelElement } from "../../base/model/smodel";

@injectable()
export class PopupPositionUpdater implements IVNodeDecorator {

    constructor(@inject(TYPES.ViewerOptions) protected options: ViewerOptions) {

    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        return vnode;
    }

    postUpdate(): void {
        const popupDiv = document.getElementById(this.options.popupDiv);
        if (popupDiv !== null && typeof window !== 'undefined') {
            const boundingClientRect = popupDiv.getBoundingClientRect();
            if (window.innerHeight < boundingClientRect.height + boundingClientRect.top) {
                popupDiv.style.top = (window.scrollY + window.innerHeight - boundingClientRect.height - 5) + 'px';
            }

            if (window.innerWidth < boundingClientRect.left + boundingClientRect.width) {
                popupDiv.style.left = (window.scrollX + window.innerWidth - boundingClientRect.width - 5) + 'px';
            }

            if (boundingClientRect.left < 0) {
                popupDiv.style.left = '0px';
            }

            if (boundingClientRect.top < 0) {
                popupDiv.style.top = '0px';
            }
        }
    }

}
