import { SChildElement, SModelElementSchema } from "../../../src/base"
import { Bounds, Direction, EMPTY_BOUNDS } from "../../../src/utils"
import { BoundsAware, boundsFeature, Selectable, selectFeature, viewportFeature } from "../../../src/features"
import { ViewportRootElement } from "../../../src/features/viewport/viewport-root"

export interface ProcessorSchema extends SModelElementSchema {
    rows: number
    columns: number
    children: SModelElementSchema[]
}

export class Processor extends ViewportRootElement implements ProcessorSchema {
    rows: number = 0
    columns: number = 0

    hasFeature(feature: symbol): boolean {
        return feature === viewportFeature || feature === boundsFeature
    }
}

export interface CoreSchema extends SModelElementSchema {
    row: number
    column: number
    load: number
    selected?: boolean
}

export class Core extends SChildElement implements CoreSchema, Selectable {
    column: number = 0
    row: number = 0
    load: number = 0
    selected: boolean = false

    hasFeature(feature: symbol): boolean {
        return feature === selectFeature
    }
}

export interface CrossbarSchema extends SModelElementSchema {
    selected?: boolean
    direction: Direction | string
    load: number
}

export class Crossbar extends SChildElement implements CrossbarSchema, Selectable, BoundsAware {
    direction: Direction
    load: number = 0
    selected: boolean = false
    revalidateBounds: boolean = true
    bounds: Bounds = EMPTY_BOUNDS

    hasFeature(feature: symbol): boolean {
        return feature === selectFeature || feature === boundsFeature
    }
}

export interface ChannelSchema extends SModelElementSchema {
    row: number
    column: number
    direction: Direction | string
    selected?: boolean
    load: number
}

export class Channel extends SChildElement implements ChannelSchema, Selectable {
    column: number = 0
    row: number = 0
    direction: Direction
    load: number = 0
    selected: boolean = false

    hasFeature(feature: symbol): boolean {
        return feature === selectFeature
    }
}


