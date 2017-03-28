import {IViewer} from "./viewer"
import {SModelRoot} from "../model/smodel"
import {injectable, inject, named} from "inversify"
import {TYPES} from "../types"
import {AnimationFrameSyncer} from "../animations/animation-frame-syncer"

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