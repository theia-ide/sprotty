/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";
import { VNode } from "snabbdom/vnode";
import { Animation } from "../../base/animations/animation";
import { CommandExecutionContext } from "../../base/commands/command";
import { SModelRoot, SModelElement, SChildElement } from "../../base/model/smodel";
import { IVNodeDecorator } from "../../base/views/vnode-decorators";
import { setAttr } from "../../base/views/vnode-utils";
import { Fadeable, isFadeable } from "./model";

export interface ResolvedElementFade {
    element: SModelElement & Fadeable
    type: 'in' | 'out'
}

export class FadeAnimation extends Animation {

    constructor(protected model: SModelRoot,
                public elementFades: ResolvedElementFade[],
                context: CommandExecutionContext,
                protected removeAfterFadeOut: boolean = false) {
        super(context);
    }

    tween(t: number, context: CommandExecutionContext): SModelRoot {
        for (const elementFade of this.elementFades) {
            const element = elementFade.element;
            if (elementFade.type === 'in') {
                element.opacity = t;
            } else if (elementFade.type === 'out') {
                element.opacity = 1 - t;
                if (t === 1 && this.removeAfterFadeOut && element instanceof SChildElement) {
                    element.parent.remove(element);
                }
            }
        }
        return this.model;
    }

}

@injectable()
export class ElementFader implements IVNodeDecorator {

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isFadeable(element)) {
            setAttr(vnode, 'opacity', element.opacity);
        }
        return vnode;
    }

    postUpdate(): void {
    }
}
