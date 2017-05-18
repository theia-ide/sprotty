/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container } from "inversify"
import { TYPES } from "../types"

export interface ViewerOptions {
    baseDiv: string
    baseClass: string
    hiddenClass: string
    popupDiv: string
    popupClass: string
    popupClosedClass: string
    boundsComputation: 'fixed' | 'dynamic'
    popupOpenDelay: number
    popupCloseDelay: number
}

export function overrideViewerOptions(container: Container, options: Partial<ViewerOptions>): ViewerOptions {
    const defaultOptions = container.get<ViewerOptions>(TYPES.ViewerOptions)
    for (const p in options) {
        (defaultOptions as any)[p] = (options as any)[p]
    }
    return defaultOptions
}
