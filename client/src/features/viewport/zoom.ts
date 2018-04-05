/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelElement } from "../../base/model/smodel";
import { MouseListener } from "../../base/views/mouse-tool";
import { Action } from "../../base/actions/action";
import { SModelExtension } from "../../base/model/smodel-extension";
import { findParentByFeature } from "../../base/model/smodel-utils";
import { ViewportAction } from "./viewport";
import { isViewport, Viewport } from "./model";

export interface Zoomable extends SModelExtension {
    zoom: number
}

export function isZoomable(element: SModelElement | Zoomable): element is Zoomable {
    return 'zoom' in element;
}

export class ZoomMouseListener extends MouseListener {

    wheel(target: SModelElement, event: WheelEvent): Action[] {
        const viewport = findParentByFeature(target, isViewport);
        if (viewport) {
            const newZoom = Math.exp(-event.deltaY * 0.005);
            const factor = 1. / (newZoom * viewport.zoom) - 1. / viewport.zoom;
            const newViewport: Viewport = {
                scroll: {
                    x: -(factor * event.offsetX - viewport.scroll.x),
                    y: -(factor * event.offsetY - viewport.scroll.y)
                },
                zoom: viewport.zoom * newZoom
            };
            return [new ViewportAction(viewport.id, newViewport, false)];
        }
        return [];
    }
}
