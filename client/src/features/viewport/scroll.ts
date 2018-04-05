/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Point } from "../../utils/geometry";
import { SModelElement, SModelRoot } from "../../base/model/smodel";
import { MouseListener } from "../../base/views/mouse-tool";
import { Action } from "../../base/actions/action";
import { SModelExtension } from "../../base/model/smodel-extension";
import { findParentByFeature } from "../../base/model/smodel-utils";
import { ViewportAction } from "./viewport";
import { isViewport, Viewport } from "./model";
import { isMoveable } from "../move/model";
import { SRoutingHandle } from "../edit/model";

export interface Scrollable extends SModelExtension {
    scroll: Point
}

export function isScrollable(element: SModelElement | Scrollable): element is Scrollable {
    return 'scroll' in element;
}

export class ScrollMouseListener extends MouseListener {

    lastScrollPosition: Point |undefined;

    mouseDown(target: SModelElement, event: MouseEvent): Action[] {
        const moveable = findParentByFeature(target, isMoveable);
        if (moveable === undefined && !(target instanceof SRoutingHandle)) {
            const viewport = findParentByFeature(target, isViewport);
            if (viewport)
                this.lastScrollPosition = { x: event.pageX, y: event.pageY };
            else
                this.lastScrollPosition = undefined;
        }
        return [];
    }

    mouseMove(target: SModelElement, event: MouseEvent): Action[] {
        if (event.buttons === 0)
            this.mouseUp(target, event);
        else if (this.lastScrollPosition) {
            const viewport = findParentByFeature(target, isViewport);
            if (viewport) {
                const dx = (event.pageX - this.lastScrollPosition.x) / viewport.zoom;
                const dy = (event.pageY - this.lastScrollPosition.y) / viewport.zoom;
                const newViewport: Viewport = {
                    scroll: {
                        x: viewport.scroll.x - dx,
                        y: viewport.scroll.y - dy,
                    },
                    zoom: viewport.zoom
                };
                this.lastScrollPosition = {x: event.pageX, y: event.pageY};
                return [new ViewportAction(viewport.id, newViewport, false)];
            }
        }
        return [];
    }

    mouseEnter(target: SModelElement, event: MouseEvent): Action[] {
        if (target instanceof SModelRoot && event.buttons === 0)
            this.mouseUp(target, event);
        return [];
    }

    mouseUp(target: SModelElement, event: MouseEvent): Action[] {
        this.lastScrollPosition = undefined;
        return [];
    }
}
