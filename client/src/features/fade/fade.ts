import { inject, injectable } from "inversify"
import { VNode } from "snabbdom/vnode"
import { Animation } from "../../base/animations/animation"
import { CommandExecutionContext } from "../../base/intent/commands"
import { SModelRoot, SModelElement, SChildElement } from "../../base/model/smodel"
import { VNodeDecorator } from "../../base/view/vnode-decorators"
import { setAttr } from "../../base/view/vnode-utils"
import { Fadeable, isFadeable } from "./model"

export interface ResolvedElementFade {
    element: SModelElement & Fadeable
    type: 'in' | 'out'
}

export class FadeAnimation extends Animation {

    constructor(protected model: SModelRoot,
                public elementFades: ResolvedElementFade[],
                context: CommandExecutionContext,
                protected removeAfterFadeOut: boolean = false) {
        super(context)
    }

    tween(t: number, context: CommandExecutionContext): SModelRoot {
        for (const elementFade of this.elementFades) {
            const element = elementFade.element
            if (elementFade.type == 'in') {
                element.opacity = t
            } else if (elementFade.type == 'out') {
                element.opacity = 1 - t
            }
            if (t == 1 && this.removeAfterFadeOut && element instanceof SChildElement) {
                element.parent.remove(element)
            }
        }
        return this.model
    }

}

@injectable()
export class ElementFader implements VNodeDecorator {

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isFadeable(element)) {
            setAttr(vnode, 'opacity', element.opacity)
        }
        return vnode
    }
    
    postUpdate(): void {
    }
}
