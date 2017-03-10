import {GModelElement, GModelRoot, ChildrenList} from "../../base/model/gmodel"
import {Selectable} from "../../base/model/behavior"
import {GCoreSchema, GChipSchema, GChannelSchema, GCrossbarSchema} from "./schema"
import {Direction} from "../../utils/geometry"

export class GChip extends GModelRoot {
    readonly rows: number
    readonly columns: number

    constructor(json: GChipSchema) {
        super(json)
        this.rows = json.rows
        this.columns = json.columns
        this.children = new ChildrenList<GChannel>(this)
        json.cores.forEach(
            coreJson => {
                if (this.isValidIndex(coreJson)) {
                    this.children.add(new GCore(coreJson))
                }
            }
        )
        json.channels.forEach(
            channelJson => {
                if (this.isValidIndex(channelJson)) {
                    this.children.add(new GChannel(channelJson))
                }
            }
        )
        json.crossbars.forEach(
            crossbarJson => this.children.add(new GCrossbar(crossbarJson))
        )
    }

    private isValidIndex(coreOrChannel: GCoreSchema | GChannelSchema): boolean {
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
        return coreOrChannel.row >= 0 && coreOrChannel.row < this.rows + rowDelta
            && coreOrChannel.column >= 0 && coreOrChannel.column < this.columns + columnDelta

    }
}

export class GCore extends GModelElement implements Selectable {
    readonly column: number
    readonly row: number
    selected: boolean

    constructor(json: GCoreSchema) {
        super(json)
        this.column = json.column
        this.row = json.row
        this.selected = json.selected || false
    }
}

export class GCrossbar extends GModelElement implements Selectable {
    readonly direction: Direction
    selected: boolean;

    constructor(json: GCrossbarSchema) {
        super(json)
        this.direction = json.direction
        this.selected = json.selected
    }
}

export class GChannel extends GModelElement implements Selectable {
    readonly column: number
    readonly row: number
    readonly direction: Direction
    throughput: number
    selected: boolean

    constructor(json: GChannelSchema) {
        super(json)
        this.column = json.column
        this.row = json.row
        this.direction = json.direction
        this.throughput = json.throughput || 0
        this.selected = json.selected || false
    }
}


