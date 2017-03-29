import { SNodeSchema, SNode } from "../../../src/graph"

export interface TaskNodeSchema extends SNodeSchema {
    kernel?: string
}

export class TaskNode extends SNode implements TaskNodeSchema {
    kernel: string = ''
}

export interface BarrierNodeSchema extends SNodeSchema {
}

export class BarrierNode extends SNode implements BarrierNodeSchema {
}
