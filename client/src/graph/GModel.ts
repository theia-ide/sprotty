import {GModelElement, GModelRoot, ChildrenList, GModelIndex} from "../base/model/GModel"
import {GGraphSchema, GNodeSchema, isGNodeSchema, GEdgeSchema} from "./GModelSchema"
import {Moveable, Selectable} from "../base/model/Behavior"

export class GGraph extends GModelRoot {
    readonly children: ChildrenList<GShape>
    readonly index: GModelIndex

    constructor(json?: GGraphSchema) {
        super({
            id: json.id,
            type: json.type
        })
        this.index = new GModelIndex()
        this.children = new ChildrenList<GShape>(this, this.index)
        if (json) {
            json.shapes.forEach(
                s => {
                    if (isGNodeSchema(s))
                        this.children.add(new GNode(s))
                    else
                        this.children.add(new GEdge(s))
                })
        }
    }
}

export class GNode extends GModelElement implements Moveable, Selectable {
    x: number
    y: number
    selected: boolean = false

    constructor(json?: GNodeSchema) {
        super(json)
    }
}

export class GEdge extends GModelElement {
    sourceId: string
    targetId: string

    constructor(json?: GEdgeSchema) {
        super(json)
    }

    get source(): GNode {
        return this.getRoot().index.getById(this.sourceId) as GNode
    }

    get target(): GNode {
        return this.getRoot().index.getById(this.targetId) as GNode
    }
}

export type GShape = GNode | GEdge

