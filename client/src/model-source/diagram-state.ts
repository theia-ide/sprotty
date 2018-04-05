/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelRootSchema, SModelElementSchema } from '../base/model/smodel';
import { CollapseExpandAction } from '../features/expand/expand';

export interface DiagramState {
    expansionState: ExpansionState
}

export class ExpansionState {
    expandedElementIds: string[] = [];

    constructor(root: SModelRootSchema) {
        this.initialize(root);
    }

    protected initialize(element: SModelElementSchema): void {
        if ((element as any).expanded)
            this.expandedElementIds.push(element.id);
        if (element.children !== undefined)
            element.children.forEach(child => this.initialize(child));
    }

    apply(action: CollapseExpandAction) {
        for (const collapsed of action.collapseIds) {
            const index = this.expandedElementIds.indexOf(collapsed);
            if (index !== -1)
                this.expandedElementIds.splice(index, 1);
        }
        for (const expanded of action.expandIds) {
            this.expandedElementIds.push(expanded);
        }
    }

    collapseAll() {
        this.expandedElementIds = [];
    }
}
