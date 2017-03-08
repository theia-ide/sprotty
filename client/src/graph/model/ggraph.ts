import {
    GModelElement, GModelRoot, GModelElementSchema, ChildrenList, GModelIndex, Moveable, Selectable
} from "../../base/model"
import {
    GGraphSchema, GNodeSchema, GEdgeSchema
} from "./ggraph-schema"

export class GGraph extends GModelRoot {

    constructor(json: GGraphSchema) {
        super(json)
    }

    protected createChild(json: GModelElementSchema): GModelElement {
        if (GGraphSchema.isGNodeSchema(json))
            return new GNode(json)
        else if (GGraphSchema.isGEdgeSchema(json))
            return new GEdge(json)
    }

}

export class GNode extends GModelElement implements Moveable, Selectable {
    x: number
    y: number
    selected: boolean = false

    constructor(json: GNodeSchema) {
        super(json)
        this.x = json.x
        this.y = json.y
        this.selected = json.selected
    }
}

export class GEdge extends GModelElement {
    sourceId: string
    targetId: string

    constructor(json: GEdgeSchema) {
        super(json)
        this.sourceId = json.sourceId
        this.targetId = json.targetId
    }

    get source(): GNode {
        return this.root.index.getById(this.sourceId) as GNode
    }

    get target(): GNode {
        return this.root.index.getById(this.targetId) as GNode
    }
}

export type GGraphElement = GNode | GEdge
