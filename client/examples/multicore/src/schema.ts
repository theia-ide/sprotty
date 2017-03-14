import {SModelElementSchema, SModelSchema} from "../../../src/base/model/smodel-schema"
import {Direction} from "../../../src/utils/geometry"

export interface GChipSchema extends SModelElementSchema {
    rows: number
    columns: number
    children: (GCoreSchema | GChannelSchema | GCrossbarSchema)[]
}

export interface GCoreSchema extends SModelElementSchema {
    row: number
    column: number
    load: number
    selected?: boolean
}

export interface GChannelSchema extends SModelElementSchema {
    row: number
    column: number
    direction: Direction
    selected?: boolean
    load: number
}

export interface GCrossbarSchema extends SModelElementSchema {
    selected?: boolean
    direction: Direction
    load: number
}

export namespace GChipSchema {
    export function isGChipSchema(schema: SModelElementSchema): schema is GChipSchema {
        return SModelSchema.getBasicType(schema) == 'chip'
    }

    export function isGCoreSchema(schema: SModelElementSchema): schema is GCoreSchema {
        return SModelSchema.getBasicType(schema) == 'core'
    }

    export function isGChannelSchema(schema: SModelElementSchema): schema is GChannelSchema {
        return SModelSchema.getBasicType(schema) == 'channel'
    }

    export function isGCrossbarSchema(schema: SModelElementSchema): schema is GCrossbarSchema {
        return SModelSchema.getBasicType(schema) == 'crossbar'
    }
}

