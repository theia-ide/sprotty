import {SModelRoot} from "../model"
import {CommandExecutionContext} from "../intent"
import {easeInOut} from "./easing"

/**
 * An animation uses the rendering loop of the browser to smoothly
 * calculate a transition between two states of a model element.
 */
export abstract class Animation {

    constructor(protected context: CommandExecutionContext, protected ease: (number) => number = easeInOut) {
    }

    start() {
        return new Promise<SModelRoot>(
            (resolve: (model: SModelRoot) => void, reject: (model: SModelRoot) => void) => {
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
                        // TODO remove this logging or use the Logger interface
                        console.log((frames * 1000 / this.context.duration) + ' fps')
                        resolve(current)
                    } else {
                        requestAnimationFrame(lambda)
                    }
                }
                let start: number | undefined = undefined
                let frames = 0
                if (typeof requestAnimationFrame === "function") {
                    requestAnimationFrame(lambda)
                } else {
                    const finalModel = this.tween(1, this.context)
                    resolve(finalModel)
                }
            })
    }

    /**
     * This method called by the animation at each rendering pass until
     * the duration is reached. Implement it to interpolate the state.
     *
     * @param t varies between 0 (start of animation) and 1 (end of animation)
     * @param context
     */
    abstract tween(t: number, context: CommandExecutionContext): SModelRoot
}
