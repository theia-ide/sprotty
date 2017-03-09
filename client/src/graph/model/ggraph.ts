import {GModelElement, GModelRoot, GModelElementSchema, Moveable, Selectable} from "../../base/model"
import {GGraphSchema, GNodeSchema, GEdgeSchema} from "./ggraph-schema"

export class GGraph extends GModelRoot {

    constructor(json: GGraphSchema) {
        super(json)
    }

    protected createChild(json: GModelElementSchema): GModelElement {
        if (GGraphSchema.isGNodeSchema(json))
            return new GNode(json)
        else if (GGraphSchema.isGEdgeSchema(json))
            return new GEdge(json)
        else
            return super.createChild(json)
    }

}

export class GNode extends GModelElement implements Moveable, Selectable {
    x: number
    y: number
    selected: boolean

    constructor(json: GNodeSchema) {
        super(json)
        if(this.selected === undefined)
            this.selected = false
    }
}

export class GEdge extends GModelElement {
    sourceId: string
    targetId: string

    constructor(json: GEdgeSchema) {
        super(json)
    }

    get source(): GNode | undefined {
        const root = this.root
        return root ? root.index.getById(this.sourceId) as GNode : undefined
    }

    get target(): GNode | undefined {
        const root = this.root
        return root ? root.index.getById(this.targetId) as GNode : undefined
    }
}

export type GGraphElement = GNode | GEdge
