import {GModelElement, GModelRoot} from "../../../src/base/model/gmodel"
import {Selectable} from "../../../src/base/model/behavior"
import {GCoreSchema, GChipSchema, GChannelSchema, GCrossbarSchema} from "./schema"
import {Direction} from "../../../src/utils/geometry"
import {GModelElementSchema} from "../../../src/base/model/gmodel-schema"

export class GChip extends GModelRoot {
    readonly rows: number
    readonly columns: number

    constructor(json: GChipSchema) {
        super(json)
    }

    protected createChild(json: GModelElementSchema) {
        if (GChipSchema.isGChannelSchema(json)) {
            this.validateIndex(json)
                return new GChannel(json)
        } else if (GChipSchema.isGCoreSchema(json)) {
            this.validateIndex(json)
            return new GCore(json)
        } else if (GChipSchema.isGCrossbarSchema(json))
            return new GCrossbar(json)
        throw Error('Illegal json element ' + json)
    }

    private validateIndex(coreOrChannel: GCoreSchema | GChannelSchema) {
        let rowDelta = 0
        let columnDelta = 0
        if (GChipSchema.isGChannelSchema(coreOrChannel)) {
            switch (coreOrChannel.direction) {
                case Direction.down:
                case Direction.up:
                    rowDelta = 1
                    break
                default:
                    columnDelta = 1
                    break;
            }
        }
        if(coreOrChannel.row < 0 || coreOrChannel.row >= this.rows + rowDelta
            || coreOrChannel.column < 0 && coreOrChannel.column >= this.columns + columnDelta)
            throw Error('Element coordinates are out of bounds ' + coreOrChannel)
    }
}

export class GCore extends GModelElement implements Selectable {
    readonly column: number
    readonly row: number
    load: number
    selected: boolean

    constructor(json: GCoreSchema) {
        super(json)
        if(this.selected === undefined)
            this.selected = false
    }
}

export class GCrossbar extends GModelElement implements Selectable {
    readonly direction: Direction
    selected: boolean

    constructor(json: GCrossbarSchema) {
        super(json)
        if(this.selected === undefined)
            this.selected = false
    }
}

export class GChannel extends GModelElement implements Selectable {
    readonly column: number
    readonly row: number
    readonly direction: Direction
    load: number
    selected: boolean

    constructor(json: GChannelSchema) {
        super(json)
        if(this.selected === undefined)
            this.selected = false
    }
}


