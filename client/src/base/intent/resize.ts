///<reference path="actions.ts"/>
import {Action} from "./actions"
import {SModelElement, SModelRoot} from "../model/smodel"
import {Dimension} from "../../utils/geometry"
import {Sizeable, isSizeable} from "../model/behavior"
import {Command, CommandExecutionContext} from "./commands"

export class ResizeAction implements Action {
    static readonly KIND = 'resize'
    readonly kind = ResizeAction.KIND

    constructor(public readonly resizes: ElementResize[]) {
    }
}

export type ElementResize = {
    elementId: string
    newSize: Dimension
}

type ResolvedElementResize = {
    element: SModelElement & Sizeable
    oldSize: Dimension
    newSize: Dimension
}

export class ResizeCommand implements Command {

    private resizes: ResolvedElementResize[] = []

    constructor(private action: ResizeAction) {}

    execute(root: SModelRoot, context: CommandExecutionContext) {
        this.action.resizes.forEach(
            resize => {
                const element = root.index.getById(resize.elementId)
                if(element && isSizeable(element)) {
                    this.resizes.push({
                        element: element,
                        oldSize: {
                            width: element.width,
                            height: element.height
                        },
                        newSize: resize.newSize
                    })
                }
            }
        )
        return this.redo(root, context)
    }

    undo(root: SModelRoot, context: CommandExecutionContext) {
        this.resizes.forEach(
            resize => {
                resize.element.width = resize.oldSize.width
                resize.element.height = resize.oldSize.height
            }
        )
        return root
    }

    redo(root: SModelRoot, context: CommandExecutionContext) {
        this.resizes.forEach(
            resize => {
                resize.element.width = resize.newSize.width
                resize.element.height = resize.newSize.height
            }
        )
        return root
    }

    merge(command: Command, context: CommandExecutionContext): boolean {
        return false
    }

}