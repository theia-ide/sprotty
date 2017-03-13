import {GModelRoot} from "../model"
import {CommandExecutionContext} from "../intent"
import {easeInOut} from "./easing"

export abstract class Animation {

    constructor(protected context: CommandExecutionContext, protected ease: (number) => number = easeInOut) {
    }

    start() {
        return new Promise<GModelRoot>(
            (resolve: (model: GModelRoot) => void, reject: (model: GModelRoot) => void) => {
                const lambda = time => {
                    frames++;
                    let dtime: number
                    if (start === undefined) {
                        start = time
                        dtime = 0
                    } else {
                        dtime = time - start
                    }
                    const t = Math.min(1, dtime / this.context.duration)
                    const current = this.tween(this.ease(t), this.context)
                    this.context.modelChanged.update(current)
                    if (t == 1) {
                        console.log((frames * 1000 / this.context.duration) + ' fps')
                        resolve(current)
                    } else {
                        requestAnimationFrame(lambda)
                    }
                }
                let start: number | undefined = undefined
                let frames = 0
                requestAnimationFrame(lambda)
            })
    }

    abstract tween(t: number, context: CommandExecutionContext): GModelRoot
}



