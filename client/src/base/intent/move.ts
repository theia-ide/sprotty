import {Point, Map} from "../../utils"
import {Animation} from "../animations"
import {GModelElement, GModelRoot, Moveable} from "../model"
import {Action} from "./actions"
import {Command, CommandExecutionContext} from "./commands"

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
    element?: GModelElement & Moveable
    toPosition: Point
}

export class MoveCommand implements Command {

    index: Map<ElementMove>

    constructor(public action: MoveAction) {
    }

    execute(model: GModelRoot, context: CommandExecutionContext) {
        this.action.moves.forEach(
            move => {
                if (!move.element)
                    move.element = model.index.getById(move.elementId) as (GModelElement & Moveable)
                if (move.element) {
                    if (!move.fromPosition)
                        move.fromPosition = {
                            x: move.element.x,
                            y: move.element.y
                        }
                    if (!this.action.animate) {
                        move.element.x = move.toPosition.x
                        move.element.y = move.toPosition.y
                    }
                }
            }
        )
        if (this.action.animate)
            return new MoveAnimation(this.action.moves, false, context).start()
        else
            return model
    }

    undo(model: GModelRoot, context: CommandExecutionContext) {
        return new MoveAnimation(this.action.moves, true, context).start()
    }

    redo(model: GModelRoot, context: CommandExecutionContext) {
        return new MoveAnimation(this.action.moves, false, context).start()
    }

    merge(command: Command) {
        if (!this.action.animate && command instanceof MoveCommand) {
            if (!this.index) {
                this.index = {}
                this.action.moves.forEach(
                    move => this.index[move.elementId] = move
                )
            }

            command.action.moves.forEach(
                otherMove => {
                    const existingMove = this.index[otherMove.elementId]
                    if (existingMove) {
                        existingMove.toPosition = otherMove.toPosition
                    } else {
                        this.action.moves.push(otherMove)
                        this.index[otherMove.elementId] = otherMove
                    }
                }
            )
            return true
        }
        return false
    }
}

export class MoveAnimation extends Animation {

    constructor(private elementsMoves: ElementMove[], private reverse: boolean, context: CommandExecutionContext) {
        super(context)
    }

    tween(t: number) {
        this.elementsMoves.forEach(
            elementMove => {
                if (this.reverse) {
                    elementMove.element.x = (1 - t) * elementMove.toPosition.x + t * elementMove.fromPosition.x
                    elementMove.element.y = (1 - t) * elementMove.toPosition.y + t * elementMove.fromPosition.y
                } else {
                    elementMove.element.x = (1 - t) * elementMove.fromPosition.x + t * elementMove.toPosition.x
                    elementMove.element.y = (1 - t) * elementMove.fromPosition.y + t * elementMove.toPosition.y

                }
            })
        return this.context.root
    }
}
