/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify";
import { VNode } from "snabbdom/vnode";
import { TYPES } from "../types";
import { ILogger } from "../../utils/logging";
import { SModelElement } from "../model/smodel";
import { IVNodeDecorator } from "./vnode-decorators";
import { DOMHelper } from "./dom-helper";
import { getAttrs } from "./vnode-utils";

@injectable()
export class IdDecorator implements IVNodeDecorator {

    constructor(@inject(TYPES.ILogger) protected logger: ILogger,
                @inject(TYPES.DOMHelper) protected domHelper: DOMHelper) {
    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        const attrs = getAttrs(vnode);
        if (attrs.id !== undefined)
            this.logger.warn(vnode, 'Overriding id of vnode (' + attrs.id + '). Make sure not to set it manually in view.');
        attrs.id = this.domHelper.createUniqueDOMElementId(element);
        if (!vnode.key)
            vnode.key = element.id;
        return vnode;
    }

    postUpdate(): void {
    }

}
