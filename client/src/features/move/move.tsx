import {VNode} from "snabbdom/vnode"
import {BehaviorSchema} from "../../base/model/behavior"
import {Point} from "../../utils/geometry"
import {SModelElement, SModelRoot, SModelIndex, SModel} from "../../base/model/smodel"
import {Action} from "../../base/intent/actions"
import {AbstractCommand, CommandExecutionContext, Command} from "../../base/intent/commands"
import {Map} from "../../utils/utils"
import {Animation} from "../../base/animations/animation"
import {MouseListener} from "../../base/view/mouse-tool"
import {isViewport, Viewport} from "../viewport/viewport"
import {isSelectable} from "../select/select"
import * as snabbdom from "snabbdom-jsx"

const JSX = {createElement: snabbdom.svg}

export interface Moveable extends BehaviorSchema, Point {
    x: number
    y: number
}

export function isMoveable(element: SModelElement | Moveable): element is Moveable {
    return 'x' in element && 'y' in element
}

export class MoveAction implements Action {
    kind = MoveCommand.KIND

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

export class MoveCommand extends AbstractCommand {
    static readonly KIND = 'move'

    resolvedMoves: Map<ResolvedElementMove> = {}

    constructor(public action: MoveAction) {
        super()
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
                        if (resolvedMove)
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
        for (let elementId in this.elementMoves) {
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

export class MoveMouseListener extends MouseListener {

    hasDragged = false
    lastDragPosition: Point | undefined

    mouseDown(target: SModelElement, event: MouseEvent): Action[] {
        if (event.button == 0) {
            if (isMoveable(target)) {
                this.lastDragPosition = {x: event.clientX, y: event.clientY}
            } else {
                this.lastDragPosition = undefined
            }
            this.hasDragged = false
        }
        return []
    }

    mouseMove(target: SModelElement, event: MouseEvent): Action[] {
        if (this.lastDragPosition) {
            const viewport = SModel.getParent<Viewport>(target, isViewport)
            this.hasDragged = true
            const zoom = viewport ? viewport.zoom : 1
            const dx = (event.clientX - this.lastDragPosition.x) / zoom
            const dy = (event.clientY - this.lastDragPosition.y) / zoom
            const root = target.root
            const nodeMoves: ElementMove[] = []
            root
                .index
                .all()
                .filter(
                    element => isSelectable(element) && element.selected
                )
                .forEach(
                    element => {
                        if (isMoveable(element)) {
                            nodeMoves.push({
                                elementId: element.id,
                                toPosition: {
                                    x: element.x + dx,
                                    y: element.y + dy
                                }
                            })
                        }
                    })
            this.lastDragPosition = {x: event.clientX, y: event.clientY}
            if (nodeMoves.length > 0)
                return [new MoveAction(nodeMoves, false)]
        }
        return []
    }

    mouseUp(target: SModelElement, event: MouseEvent): Action[] {
        this.hasDragged = false
        this.lastDragPosition = undefined
        return []
    }

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isMoveable(element)) {
            const translate = 'translate(' + element.x + ', ' + element.y + ')'
            vnode = <g transform={translate}>{vnode}</g>
        }
        return vnode
    }
}