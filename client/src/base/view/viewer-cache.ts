import { IViewer } from "./viewer"
import { SModelRoot } from "../model/smodel"
import { inject, injectable, named } from "inversify"
import { TYPES } from "../types"
import { AnimationFrameSyncer } from "../animations/animation-frame-syncer"

/**
 * Updating the view is rather expensive, and it doesn't make sense to calculate
 * more then one update per animation (rendering) frame. So this class batches
 * all incoming model changes and only renders the last one when the next animation
 * frame comes.
 */
@injectable()
export class ViewerCache implements IViewer {

    @inject(TYPES.IViewer)@named('delegate') delegate: IViewer
    @inject(TYPES.IAnimationFrameSyncer) syncer: AnimationFrameSyncer

    cachedModelRoot: SModelRoot | undefined

    update(model: SModelRoot): void {
        const isCacheEmpty = this.cachedModelRoot === undefined
        this.cachedModelRoot = model
        if(isCacheEmpty) {
            this.syncer.onEndOfNextFrame(() => {
                if(this.cachedModelRoot) {
                    const nextModelRoot = this.cachedModelRoot
                    this.delegate.update(nextModelRoot)
                    this.cachedModelRoot = undefined
                }
            })
        }
    }
}