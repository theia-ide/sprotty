import { SNodeSchema, SNode } from "../../../src/graph"

export interface ExecutionNodeSchema extends SNodeSchema {
    taskName?: string
}

export class ExecutionNode extends SNode implements ExecutionNodeSchema {
    taskName: string = ''
}

export interface BarrierNodeSchema extends SNodeSchema {
}

export class BarrierNode extends SNode implements BarrierNodeSchema {
}
