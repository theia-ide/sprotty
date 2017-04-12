import { SNode, SNodeSchema } from "../../../src/graph"

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
    width: number = 50
    height: number = 10
}
