import {GModelElementSchema, GModelSchema} from "../../../src/base/model/gmodel-schema"
import {Direction} from "../../../src/utils/geometry"

export interface GChipSchema extends GModelElementSchema {
    rows: number
    columns: number
    children: (GCoreSchema | GChannelSchema | GCrossbarSchema)[]
}

export interface GCoreSchema extends GModelElementSchema {
    row: number
    column: number
    load: number
    selected?: boolean
}

export interface GChannelSchema extends GModelElementSchema {
    row: number
    column: number
    direction: Direction
    selected?: boolean
    load: number
}

export interface GCrossbarSchema extends GModelElementSchema {
    selected?: boolean
    direction: Direction
}


export namespace GChipSchema {
    export function isGChipSchema(schema: GModelElementSchema): schema is GChipSchema {
        return GModelSchema.getBasicType(schema) == 'chip'
    }

    export function isGCoreSchema(schema: GModelElementSchema): schema is GCoreSchema {
        return GModelSchema.getBasicType(schema) == 'core'
    }

    export function isGChannelSchema(schema: GModelElementSchema): schema is GChannelSchema {
        return GModelSchema.getBasicType(schema) == 'channel'
    }

    export function isGCrossbarSchema(schema: GModelElementSchema): schema is GCrossbarSchema {
        return GModelSchema.getBasicType(schema) == 'crossbar'
    }
}

