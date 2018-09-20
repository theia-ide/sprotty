/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Action } from "../../base/actions/action";
import { SModelElement } from "../../base/model/smodel";

/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

 export const creatingOnDragFeature = Symbol('creatingOnDragFeature');

export interface CreatingOnDrag {
    createAction(id: string): Action;
}

export function isCreatingOnDrag<T extends SModelElement>(element: T): element is T & CreatingOnDrag {
    return element.hasFeature(creatingOnDragFeature) && (element as any).createAction !== undefined;
}

