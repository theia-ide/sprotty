/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelRoot, SModelRootSchema, SGraph, popupFeature } from "../../../src";

export class Mindmap extends SGraph {

    hasFeature(feature: symbol): boolean {
        if (feature === popupFeature)
            return true;
        else
            return super.hasFeature(feature);
    }

}

export interface PopupButtonSchema extends SModelRootSchema {
    kind: string
    target: string
}

export class PopupButton extends SModelRoot {
    kind: string;
    target: string;
}
