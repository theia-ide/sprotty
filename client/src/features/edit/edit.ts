import { Action } from "../../base/actions/action"
import { Command, CommandExecutionContext, CommandResult } from "../../base/commands/command"
import { SModelElement, SModelRoot } from "../../base/model/smodel"
import { Editable, hasEditFeature, isEditable } from "./model"
import { injectable } from "inversify"
import { IVNodeDecorator } from "../../base/views/vnode-decorators"
import { VNode } from "snabbdom/vnode"
import { setClass } from "../../base/views/vnode-utils"
import { SRoutingPoint, SEdge } from "../../graph/sgraph"
import { centerOfLine, Point } from "../../utils/geometry"
import { SelectAction } from "../select/select"
import { findParent } from "../../base/model/smodel-utils"
import { ElementMove } from "../move/move"
import { KeyListener } from "../../base/views/key-tool"

export class ShowRoutingPointsAction implements Action {
    kind: string = ShowRoutingPointsCommand.KIND

    constructor(public priviousAction?: Action) {
    }
}

export class ShowRoutingPointsCommand implements Command {
    static KIND: string = "routingPointsVisible"

    constructor(public action: ShowRoutingPointsAction) {
    }

    execute(context: CommandExecutionContext): CommandResult {
        const sModelRoot = context.root

        const createRoutingPoint = (cptype: string, id: string, position: Point) => {
            const sRoutingPoint = new SRoutingPoint()
            sRoutingPoint.type = cptype
            sRoutingPoint.id = id
            sRoutingPoint.position = position
            return sRoutingPoint
        }

        const showRoutingPoint = (editTarget: Editable) => {
            if (editTarget instanceof SEdge) {
                const sourceRoutingPoint = createRoutingPoint('routing-point', editTarget.id + '_source',
                    editTarget.anchors.sourceAnchor)
                const targetRoutingPoint = createRoutingPoint('routing-point', editTarget.id + '_target',
                    editTarget.anchors.targetAnchor)
                const rpNumber = editTarget.routingPoints.length
                let prevPoint: SRoutingPoint = sourceRoutingPoint
                for (let i = 0; i < rpNumber; i++) {
                    const routingPoint: SRoutingPoint = editTarget.routingPoints[i]
                    routingPoint.id = editTarget.id + '_cp' + i
                    const volatileRoutingPoint = createRoutingPoint(
                        'volatile-routing-point',
                        editTarget.id + '_vcp' + i,
                        centerOfLine(prevPoint.position, routingPoint.position))
                    volatileRoutingPoint.anchors = [prevPoint, routingPoint]
                    editTarget.add(volatileRoutingPoint)
                    editTarget.add(routingPoint)
                    prevPoint = routingPoint
                }
                const volatileRoutingPoint = createRoutingPoint(
                    'volatile-routing-point',
                    editTarget.id + '_vcp' + rpNumber,
                    centerOfLine(prevPoint.position, targetRoutingPoint.position))
                volatileRoutingPoint.anchors = [prevPoint, targetRoutingPoint]
                editTarget.add(volatileRoutingPoint)
            }
        }

        sModelRoot.index.all().forEach(element => {
            if (element instanceof SEdge) {
                if (element.inEditMode) {
                    if (!element.routingPointsVisible) {
                        showRoutingPoint(element)
                        element.routingPointsVisible = true
                    } else if (element.routingPointsVisible) {
                        if (this.action.priviousAction instanceof MoveRoutingPointAction ||
                            this.action.priviousAction === undefined) {
                            while (element.children.length) {
                                element.remove(element.children[0])
                            }
                            showRoutingPoint(element)
                        }
                    }
                } else {
                    element.routingPointsVisible = false
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

export class MoveRoutingPointAction implements Action {
    kind: string = MoveRoutingPointCommand.KIND

    constructor(public moveElements: ElementMove[]) {
    }

}

export class MoveRoutingPointCommand implements Command {
    static KIND: string = 'routingPointCreated'
    protected moveElements: ElementMove[] = []

    constructor(action: MoveRoutingPointAction) {
        this.moveElements = action.moveElements
    }

    execute(context: CommandExecutionContext): CommandResult {
        this.moveElements.forEach(element => {
            const moveElement: SModelElement | undefined = context.root.index.getById(element.elementId)
            if (moveElement instanceof SRoutingPoint) {
                const sEdge = (moveElement.parent as SEdge)
                const routingPoints = sEdge.routingPoints
                const routingPoint = routingPoints.find(rp => {
                    return rp.id === moveElement.id
                })
                // if the dragged routing point is not a routing point already, it becomes one now
                if (routingPoint === undefined) {
                    moveElement.type = 'routing-point'
                    const indexOfPredecessor = routingPoints.indexOf(moveElement.anchors[0])
                    if (indexOfPredecessor !== -1)
                        routingPoints.splice(indexOfPredecessor + 1, 0, moveElement)
                    else
                        routingPoints.unshift(moveElement)
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

export class EditKeyboardListener extends KeyListener {
    keyPress(element: SModelElement, event: KeyboardEvent): Action[] {
        if (event.keyCode === 8 || event.keyCode === 46) {
            element.root.index.all()
                .filter(e => e instanceof SEdge && isEditable(e) && e.inEditMode)
                .forEach(e => {
                    let idx: number
                    const routingPoints = (e as SEdge).routingPoints
                    while ((idx = routingPoints.findIndex(rp => rp.selected)) !== -1)
                        routingPoints.splice(idx, 1)
                })
            return [new ShowRoutingPointsAction()]
        }
        return []
    }
}