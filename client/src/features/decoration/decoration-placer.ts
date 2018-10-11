/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";
import { VNode } from "snabbdom/vnode";
import { SModelElement, SChildElement } from "../../base/model/smodel";
import { IVNodeDecorator } from "../../base/views/vnode-decorators";
import { isDecoration, Decoration } from "./model";
import { setAttr } from "../../base/views/vnode-utils";
import { Point, ORIGIN_POINT } from "../../utils/geometry";
import { SEdge } from "../../graph/sgraph";
import { isSizeable } from "../bounds/model";

@injectable()
export class DecorationPlacer implements IVNodeDecorator {
    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isDecoration(element)) {
            const position = this.getPosition(element);
            const translate = 'translate(' + position.x + ', ' + position.y + ')';
            setAttr(vnode, 'transform', translate);
        }
        return vnode;
    }

    protected getPosition(element: SModelElement & Decoration): Point {
        if (element instanceof SChildElement && element.parent instanceof SEdge) {
            const route = element.parent.route();
            if (route.length > 1) {
                const index = Math.floor(0.5  * (route.length - 1));
                const offset = isSizeable(element)
                    ? {
                        x: - 0.5 * element.bounds.width,
                        y: - 0.5 * element.bounds.width
                    }
                    : ORIGIN_POINT;
                return {
                    x: 0.5 * (route[index].x + route[index + 1].x) + offset.x,
                    y: 0.5 * (route[index].y + route[index + 1].y) + offset.y
                };
            }
        }
        if (isSizeable(element))
            return {
                x: -0.666 * element.bounds.width,
                y: -0.666 * element.bounds.height
            };
        return ORIGIN_POINT;
    }

    postUpdate(): void {
    }
}