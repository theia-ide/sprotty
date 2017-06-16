import { Action } from "../../base/actions/action"
import { Command, CommandExecutionContext, CommandResult } from "../../base/commands/command"
import { SChildElement, SModelElement, SModelRoot } from "../../base/model/smodel"
import { isEditable } from "./model"
import { injectable } from "inversify"
import { IVNodeDecorator } from "../../base/views/vnode-decorators"
import { VNode } from "snabbdom/vnode"
import { setClass } from "../../base/views/vnode-utils"

export class ActivateEditModeAction implements Action {
    kind: string = ActivateEditModeCommand.KIND

    constructor(public readonly elementsToToggle: string[], public readonly elementsToDeactivate: string[]) {

    }
}

export class ActivateEditModeCommand implements Command {

    protected elementsToToggle: string[]
    protected elementsToDeactivate: string[]
    static KIND: string = "editModeActivated"

    constructor(public action: ActivateEditModeAction) {
        this.elementsToToggle = action.elementsToToggle
        this.elementsToDeactivate = action.elementsToDeactivate
    }

    execute(context: CommandExecutionContext): CommandResult {
        const sModelRoot: SModelRoot = context.root

        const changeEditMode = (id: string, toggle: boolean) => {
            const element = sModelRoot.index.getById(id)
            if (element instanceof SChildElement && isEditable(element)) {
                element.inEditMode = toggle ? !element.inEditMode : false
            }
        }

        this.elementsToToggle.forEach(id => {
            changeEditMode(id, true)
        })

        this.elementsToDeactivate.forEach(id => {
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