/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { CommandExecutionContext } from "../commands/command";
import { SModelRoot } from "../model/smodel";
import { easeInOut } from "./easing";

/**
 * An animation uses the rendering loop of the browser to smoothly
 * calculate a transition between two states of a model element.
 */
export abstract class Animation {

    constructor(protected context: CommandExecutionContext, protected ease: (x: number) => number = easeInOut) {
    }

    start(): Promise<SModelRoot> {
        return new Promise<SModelRoot>(
            (resolve: (model: SModelRoot) => void, reject: (model: SModelRoot) => void) => {
                let start: number | undefined = undefined;
                let frames = 0;
                const lambda = (time: number) => {
                    frames++;
                    let dtime: number;
                    if (start === undefined) {
                        start = time;
                        dtime = 0;
                    } else {
                        dtime = time - start;
                    }
                    const t = Math.min(1, dtime / this.context.duration);
                    const current = this.tween(this.ease(t), this.context);
                    this.context.modelChanged.update(current);
                    if (t === 1) {
                        this.context.logger.log(this, (frames * 1000 / this.context.duration) + ' fps');
                        resolve(current);
                    } else {
                        this.context.syncer.onNextFrame(lambda);
                    }
                };
                if (this.context.syncer.isAvailable()) {
                    this.context.syncer.onNextFrame(lambda);
                } else {
                    const finalModel = this.tween(1, this.context);
                    resolve(finalModel);
                }
            });
    }

    /**
     * This method called by the animation at each rendering pass until
     * the duration is reached. Implement it to interpolate the state.
     *
     * @param t varies between 0 (start of animation) and 1 (end of animation)
     * @param context
     */
    abstract tween(t: number, context: CommandExecutionContext): SModelRoot;
}

export class CompoundAnimation extends Animation {

    constructor(protected model: SModelRoot,
                protected context: CommandExecutionContext,
                public components: Animation[] = [],
                protected ease: (x: number) => number = easeInOut) {
        super(context, ease);
    }

    include(animation: Animation): this {
        this.components.push(animation);
        return this;
    }

    tween(t: number, context: CommandExecutionContext): SModelRoot {
        for (const a of this.components) {
            a.tween(t, context);
        }
        return this.model;
    }

}
