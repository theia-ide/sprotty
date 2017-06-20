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

export class ActivateEditModeAction implements Action {
    kind: string = ActivateEditModeCommand.KIND
    elementsToToggle: string[] = []
    elementsToDeactivate: string[] = []
    selectAction: SelectAction

    constructor(action: SelectAction) {
        if (action.selectedElementsIDs !== undefined)
            action.selectedElementsIDs.forEach(id => {
                this.elementsToToggle.push(id)
            })
        if (action.deselectedElementsIDs !== undefined)
            action.deselectedElementsIDs.forEach(id => {
                this.elementsToDeactivate.push(id)
            })
        this.selectAction = action
    }
}

export class ActivateEditModeCommand implements Command {

    protected elementsToActivate: string[]
    protected elementsToDeactivate: string[]
    static KIND: string = "editModeActivated"

    constructor(public action: ActivateEditModeAction) {
        this.elementsToActivate = action.elementsToToggle
        this.elementsToDeactivate = action.elementsToDeactivate
    }

    execute(context: CommandExecutionContext): CommandResult {
        const sModelRoot: SModelRoot = context.root
        const dontDeactivate: string[] = []

        const createControlPoint = (cptype: string, id: string, position: Point) => {
            const sControlPoint = new SControlPoint()
            sControlPoint.type = cptype
            sControlPoint.id = id
            sControlPoint.position = position
            return sControlPoint
        }

        const changeEditMode = (id: string, deactivate: boolean) => {
            const element = sModelRoot.index.getById(id)
            const editTarget = element ? findParent(element, hasEditFeature) : undefined
            if (editTarget instanceof SEdge) {
                if (!editTarget.inEditMode && !deactivate) {
                    editTarget.inEditMode = true
                    if (editTarget.routingPoints.length === 0) {
                        const sourceAnchor = editTarget.anchors.sourceAnchor
                        const targetAnchor = editTarget.anchors.targetAnchor
                        if (sourceAnchor && targetAnchor) {
                            editTarget.add(createControlPoint('control-point', 'startcp', sourceAnchor))
                            editTarget.add(createControlPoint('control-point', 'endcp', targetAnchor))
                            editTarget.add(
                                createControlPoint('volatile-control-point', 'vcp',
                                    centerOfLine(sourceAnchor, targetAnchor)))
                        }
                    } else {
                        // editTarget.routingPoints.forEach()
                    }

                } else if (editTarget.inEditMode && !deactivate) {
                    editTarget.inEditMode = true
                } else {
                    editTarget.inEditMode = false
                    while (editTarget.children.length)
                        editTarget.remove(editTarget.children[0])
                }
                if (editTarget.inEditMode)
                    dontDeactivate.push(editTarget.id)
            }
        }

        this.elementsToActivate.forEach(id => {
            changeEditMode(id, false)
        })

        this.elementsToDeactivate.forEach(id => {
            if (dontDeactivate.indexOf(id) === -1)
                changeEditMode(id, true)
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