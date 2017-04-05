import { SNode, SNodeSchema } from "../../../src/graph"

export interface TaskNodeSchema extends SNodeSchema {
    kernel?: string
    status?: string
}

export class TaskNode extends SNode implements TaskNodeSchema {
    kernel: string = ''
    status?: string
}

export interface BarrierNodeSchema extends SNodeSchema {
}

export class BarrierNode extends SNode implements BarrierNodeSchema {
    width: number = 50
    height: number = 10
}
