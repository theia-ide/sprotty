/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelElementSchema, SModelRootSchema, RequestPopupModelAction, PreRenderedElementSchema } from "../../../src"

export function popupModelFactory(request: RequestPopupModelAction, element?: SModelElementSchema): SModelRootSchema | undefined {
    if (element !== undefined && element.type === 'node:class') {
        return {
            type: 'html',
            id: 'popup',
            children: [
                <PreRenderedElementSchema> {
                    type: 'pre-rendered',
                    id: 'popup-title',
                    code: `<div class="popup-title">Class ${element.id === 'node0' ? 'Foo' : 'Bar'}</div>`
                },
                <PreRenderedElementSchema> {
                    type: 'pre-rendered',
                    id: 'popup-body',
                    code: '<div class="popup-body">But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness.</div>'
                }
            ]
        }
    }
    return undefined
}
