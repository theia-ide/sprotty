import { Animation } from "../../base/animations/animation"
import { CommandExecutionContext } from "../../base/intent/commands"
import { SModelRoot, SModelElement, SChildElement } from "../../base/model/smodel"
import { Fadeable } from "./model"

export interface ResolvedElementFade {
    element: SModelElement & Fadeable
    type: 'in' | 'out'
}

export class FadeAnimation extends Animation {

    constructor(protected elementFades: ResolvedElementFade[], context: CommandExecutionContext,
            protected removeAfterFadeOut: boolean = false) {
        super(context)
    }

    tween(t: number, context: CommandExecutionContext): SModelRoot {
        for (const elementFade of this.elementFades) {
            const element = elementFade.element
            if (elementFade.type == 'in') {
                element.alpha = t
            } else if (elementFade.type == 'out') {
                element.alpha = 1 - t
            }
            if (t == 1 && this.removeAfterFadeOut && element instanceof SChildElement) {
                element.parent.remove(element)
            }
        }
        return context.root
    }

}
