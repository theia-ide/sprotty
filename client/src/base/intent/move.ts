import {Point, Map} from "../../utils"
import {Animation} from "../animations"
import {SModelElement, SModelRoot, Moveable} from "../model"
import {Action} from "./actions"
import {Command, CommandExecutionContext} from "./commands"
import {SModelIndex} from "../model/smodel"

export const MoveKind = 'Move'

export class MoveAction implements Action {
    kind = MoveKind

    constructor(public readonly moves: ElementMove[],
                public readonly animate: boolean) {
    }
}

export type ElementMove = {
    fromPosition?: Point
    elementId: string
    toPosition: Point
}

export type ResolvedElementMove = {
    fromPosition: Point
    elementId: string
    element: SModelElement & Moveable
    toPosition: Point
}

export class MoveCommand implements Command {

    resolvedMoves: Map<ResolvedElementMove>

    constructor(public action: MoveAction) {
    }

    execute(model: SModelRoot, context: CommandExecutionContext) {
        this.action.moves.forEach(
            move => {
                const resolvedMove = this.resolve(move, model.index)
                if (resolvedMove) {
                    this.resolvedMoves[resolvedMove.elementId] = resolvedMove
                    if (!this.action.animate) {
                        resolvedMove.element.x = move.toPosition.x
                        resolvedMove.element.y = move.toPosition.y
                    }
                }
            }
        )
        if (this.action.animate)
            return new MoveAnimation(this.resolvedMoves, false, context).start()
        else
            return model
    }

    private resolve(move: ElementMove, index: SModelIndex): ResolvedElementMove | undefined {
        const element = index.getById(move.elementId) as (SModelElement & Moveable)
        if (element) {
            const fromPosition = move.fromPosition
                || {x: element.x, y: element.y}
            return {
                fromPosition: fromPosition,
                elementId: move.elementId,
                element: element,
                toPosition: move.toPosition
            }
        }
        return undefined
    }

    undo(model: SModelRoot, context: CommandExecutionContext) {
        return new MoveAnimation(this.resolvedMoves, true, context).start()
    }

    redo(model: SModelRoot, context: CommandExecutionContext) {
        return new MoveAnimation(this.resolvedMoves, false, context).start()
    }

    merge(command: Command, context: CommandExecutionContext) {
        if (!this.action.animate && command instanceof MoveCommand) {
            command.action.moves.forEach(
                otherMove => {
                    const existingMove = this.resolvedMoves[otherMove.elementId]
                    if (existingMove) {
                        existingMove.toPosition = otherMove.toPosition
                    } else {
                        const resolvedMove = this.resolve(otherMove, context.root.index)
                        if(resolvedMove)
                            this.resolvedMoves[resolvedMove.elementId] = resolvedMove
                    }
                }
            )
            return true
        }
        return false
    }
}

export class MoveAnimation extends Animation {

    constructor(private elementMoves: Map<ResolvedElementMove>, private reverse: boolean, context: CommandExecutionContext) {
        super(context)
    }

    tween(t: number) {
        for(let elementId in this.elementMoves) {
            const elementMove = this.elementMoves[elementId]
            if (this.reverse) {
                elementMove.element.x = (1 - t) * elementMove.toPosition.x + t * elementMove.fromPosition.x
                elementMove.element.y = (1 - t) * elementMove.toPosition.y + t * elementMove.fromPosition.y
            } else {
                elementMove.element.x = (1 - t) * elementMove.fromPosition.x + t * elementMove.toPosition.x
                elementMove.element.y = (1 - t) * elementMove.fromPosition.y + t * elementMove.toPosition.y

            }
        }
        return this.context.root
    }
}
