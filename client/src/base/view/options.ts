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
}

export function overrideViewerOptions(container: Container, options: Partial<ViewerOptions>): ViewerOptions {
    const defaultOptions = container.get<ViewerOptions>(TYPES.ViewerOptions)
    for (const p in options) {
        (defaultOptions as any)[p] = (options as any)[p]
    }
    return defaultOptions
}
