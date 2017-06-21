import { Action } from "../../base/actions/action"
import { Command, CommandExecutionContext, CommandResult } from "../../base/commands/command"
import { SModelElement, SModelRoot } from "../../base/model/smodel"
import { hasEditFeature, isEditable } from "./model"
import { injectable } from "inversify"
import { IVNodeDecorator } from "../../base/views/vnode-decorators"
import { VNode } from "snabbdom/vnode"
import { setClass } from "../../base/views/vnode-utils"
import { SControlPoint, SEdge } from "../../graph/sgraph"
import { centerOfLine, Point } from "../../utils/geometry"
import { SelectAction } from "../select/select"
import { findParent } from "../../base/model/smodel-utils"
import { ElementMove, MoveAction } from "../move/move"

export class ShowControlPointsAction implements Action {
    kind: string = ShowControlPointsCommand.KIND

    constructor(public priviousAction: Action) {
    }
}

export class ShowControlPointsCommand implements Command {
    static KIND: string = "controlPointsVisible"

    constructor(public action: ShowControlPointsAction) {
    }

    execute(context: CommandExecutionContext): CommandResult {
        const sModelRoot = context.root

        const createControlPoint = (cptype: string, id: string, position: Point) => {
            const sControlPoint = new SControlPoint()
            sControlPoint.type = cptype
            sControlPoint.id = id
            sControlPoint.position = position
            return sControlPoint
        }

        const showControlPoint = (editTarget: SEdge) => {
            if (editTarget instanceof SEdge) {
                if (editTarget.routingPoints.length === 0) {
                    const sourceAnchor = editTarget.anchors.sourceAnchor
                    const targetAnchor = editTarget.anchors.targetAnchor
                    if (sourceAnchor && targetAnchor) {
                        const controlPoint = createControlPoint(
                            'volatile-control-point', editTarget.id + '_vcp', centerOfLine(sourceAnchor, targetAnchor))
                        controlPoint.volatile = true
                        editTarget.add(controlPoint)
                    }
                } else {
                    // editTarget.routingPoints.forEach()
                }
            }
        }

        sModelRoot.index.all().forEach(element => {
            if (element instanceof SEdge) {
                if (element.inEditMode) {
                    if (!element.controlPointsVisible) {
                        showControlPoint(element)
                        element.controlPointsVisible = true
                    } else if (element.controlPointsVisible) {
                        // FIXME improve this, its very expensive, better just set new positions
                        if (this.action.priviousAction instanceof MoveAction) {
                            const cp = this.action.priviousAction.moves.find(moveEl => {
                                return sModelRoot.index.getById(moveEl.elementId) instanceof SControlPoint
                            })
                            if (cp === undefined) {
                                console.log("bla privious", this.action.priviousAction)
                                while (element.children.length)
                                    element.remove(element.children[0])
                                showControlPoint(element)
                            }
                        }
                    }
                } else {
                    element.controlPointsVisible = false
                    while (element.children.length)
                        element.remove(element.children[0])
                }
            }
        })

        return context.root
    }

    undo(context: CommandExecutionContext): CommandResult {
        return context.root
    }

    redo(context: CommandExecutionContext): CommandResult {
        return context.root
    }

}

export class MoveControlPointAction implements Action {
    kind: string = MoveControlPointCommand.KIND

    constructor(public moveElements: ElementMove[]) {
    }

}

export class MoveControlPointCommand implements Command {
    static KIND: string = "routingPointCreated"
    protected moveElements: ElementMove[] = []

    constructor(action: MoveControlPointAction) {
        this.moveElements = action.moveElements
    }

    execute(context: CommandExecutionContext): CommandResult {
        this.moveElements.forEach(element => {
            const moveElement: SModelElement | undefined = context.root.index.getById(element.elementId)
            if (moveElement instanceof SControlPoint) {
                const sEdge = (moveElement.parent as SEdge)
                const routingPoints = sEdge.routingPoints
                const routingPoint = routingPoints.find(rp => {
                    return rp.id === moveElement.id
                })
                if (routingPoint === undefined) {
                    moveElement.volatile = false
                    routingPoints.push(moveElement)
                }
            }
        })
        return context.root
    }

    undo(context: CommandExecutionContext): CommandResult {
        return context.root
    }

    redo(context: CommandExecutionContext): CommandResult {
        return context.root
    }

}

export class ActivateEditModeAction implements Action {
    kind: string = ActivateEditModeCommand.KIND
    elementsToActivate: string[] = []
    elementsToDeactivate: string[] = []

    constructor(action: SelectAction) {
        if (action.selectedElementsIDs !== undefined)
            action.selectedElementsIDs.forEach(id => {
                this.elementsToActivate.push(id)
            })
        if (action.deselectedElementsIDs !== undefined)
            action.deselectedElementsIDs.forEach(id => {
                this.elementsToDeactivate.push(id)
            })
    }
}

export class ActivateEditModeCommand implements Command {

    protected elementsToActivate: string[]
    protected elementsToDeactivate: string[]
    static KIND: string = "editModeActivated"

    constructor(public action: ActivateEditModeAction) {
        this.elementsToActivate = action.elementsToActivate
        this.elementsToDeactivate = action.elementsToDeactivate
    }

    execute(context: CommandExecutionContext): CommandResult {
        const sModelRoot: SModelRoot = context.root

        const changeEditMode = (id: string, deactivate: boolean) => {
            const element = sModelRoot.index.getById(id)
            const editTarget = element ? findParent(element, hasEditFeature) : undefined
            if (editTarget instanceof SEdge) {
                const source = editTarget.source
                const target = editTarget.target
                if (source && target)
                    if (this.elementsToActivate.indexOf(source.id) === -1 &&
                        this.elementsToActivate.indexOf(target.id) === -1) {
                        if (!editTarget.inEditMode && !deactivate) {
                            editTarget.inEditMode = true
                        } else if (editTarget.inEditMode && !deactivate) {
                            editTarget.inEditMode = true
                        } else {
                            editTarget.inEditMode = false
                        }
                    }
            }
        }

        this.elementsToDeactivate.forEach(id => {
            changeEditMode(id, true)
        })

        this.elementsToActivate.forEach(id => {
            changeEditMode(id, false)
        })

        return context.root
    }

    undo(context: CommandExecutionContext): CommandResult {
        return context.root
    }

    redo(context: CommandExecutionContext): CommandResult {
        return context.root
    }
}

@injectable()
export class EditActivationDecorator implements IVNodeDecorator {
    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isEditable(element))
            setClass(vnode, 'edit', element.inEditMode)
        return vnode
    }

    postUpdate(): void {
    }

}