import { SNode, SNodeSchema } from "../../../src/graph"
import { Bounds } from "../../../src/utils/geometry"
import { moveFeature } from "../../../src/features"

export interface TaskNodeSchema extends SNodeSchema {
    name?: string
    status?: string
}

export class TaskNode extends SNode implements TaskNodeSchema {
    name: string = ''
    status?: string

    hasFeature(feature: symbol): boolean {
        if (feature === moveFeature)
            return false
        else
            return super.hasFeature(feature)
    }
}

export interface BarrierNodeSchema extends SNodeSchema {
}

export class BarrierNode extends SNode implements BarrierNodeSchema {
    name: string = ''
    bounds: Bounds = { x: 0, y: 0, width: 50, height: 20 }

    hasFeature(feature: symbol): boolean {
        if (feature === moveFeature)
            return false
        else
            return super.hasFeature(feature)
    }
}
