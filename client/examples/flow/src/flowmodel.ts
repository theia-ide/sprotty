import { SNode, SNodeSchema } from "../../../src/graph"
import { Bounds } from "../../../src/utils/geometry"

export interface TaskNodeSchema extends SNodeSchema {
    name?: string
    status?: string
}

export class TaskNode extends SNode implements TaskNodeSchema {
    name: string = ''
    status?: string
}

export interface BarrierNodeSchema extends SNodeSchema {
}

export class BarrierNode extends SNode implements BarrierNodeSchema {
    bounds: Bounds = { x: 0, y: 0, width: 50, height: 10 }
}
