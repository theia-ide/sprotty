import {SModelRoot, SModelElementSchema, SChildElement} from "../../../src/base/model/smodel"
import {Selectable} from "../../../src/base/model/behavior"
import {Direction} from "../../../src/utils/geometry"

export interface ChipSchema extends SModelElementSchema {
    rows: number
    columns: number
    children: SModelElementSchema[]
}

export class Chip extends SModelRoot implements ChipSchema {
    readonly rows: number
    readonly columns: number
}

export interface CoreSchema extends SModelElementSchema {
    row: number
    column: number
    load: number
    selected?: boolean
}

export class Core extends SChildElement implements CoreSchema, Selectable {
    readonly column: number
    readonly row: number
    load: number
    selected: boolean = false
}

export interface CrossbarSchema extends SModelElementSchema {
    selected?: boolean
    direction: Direction
    load: number
}


export class Crossbar extends SChildElement implements CrossbarSchema, Selectable {
    readonly direction: Direction
    load: number
    selected: boolean = false
}

export interface ChannelSchema extends SModelElementSchema {
    row: number
    column: number
    direction: Direction
    selected?: boolean
    load: number
}

export class Channel extends SChildElement implements ChannelSchema, Selectable {
    readonly column: number
    readonly row: number
    readonly direction: Direction
    load: number
    selected: boolean = false
}


