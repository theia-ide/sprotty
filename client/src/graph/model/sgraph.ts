import {SModelElement, SModelRoot, SModelElementSchema, Moveable, Selectable} from "../../base/model"
import {SGraphSchema, SNodeSchema, SEdgeSchema} from "./sgraph-schema"

export class SGraph extends SModelRoot {

    constructor(json: SGraphSchema) {
        super(json)
    }

    protected createChild(json: SModelElementSchema): SModelElement {
        if (SGraphSchema.isGNodeSchema(json))
            return new SNode(json)
        else if (SGraphSchema.isGEdgeSchema(json))
            return new SEdge(json)
        else
            return super.createChild(json)
    }

}

export class SNode extends SModelElement implements Moveable, Selectable {
    x: number
    y: number
    selected: boolean

    constructor(json: SNodeSchema) {
        super(json)
        if(this.selected === undefined)
            this.selected = false
    }
}

export class SEdge extends SModelElement {
    sourceId: string
    targetId: string

    constructor(json: SEdgeSchema) {
        super(json)
    }

    get source(): SNode | undefined {
        return this.root.index.getById(this.sourceId) as SNode
    }

    get target(): SNode | undefined {
        return this.root.index.getById(this.targetId) as SNode
    }
}

export type GGraphElement = SNode | SEdge
