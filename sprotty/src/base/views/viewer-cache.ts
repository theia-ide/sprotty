/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable, named } from "inversify";
import { SModelRoot } from "../model/smodel";
import { TYPES } from "../types";
import { AnimationFrameSyncer } from "../animations/animation-frame-syncer";
import { IViewer } from "./viewer";

/**
 * Updating the view is rather expensive, and it doesn't make sense to calculate
 * more then one update per animation (rendering) frame. So this class batches
 * all incoming model changes and only renders the last one when the next animation
 * frame comes.
 */
@injectable()
export class ViewerCache implements IViewer {
    constructor(@inject(TYPES.IViewer) @named('delegate') protected delegate: IViewer,
                @inject(TYPES.AnimationFrameSyncer) protected syncer: AnimationFrameSyncer) {
    }

    cachedModelRoot: SModelRoot | undefined;
    cachedHiddenModelRoot: SModelRoot | undefined;
    cachedPopup: SModelRoot | undefined;

    protected isCacheEmpty(): boolean {
        return this.cachedModelRoot === undefined && this.cachedHiddenModelRoot === undefined &&
            this.cachedPopup === undefined;
    }

    updatePopup(model: SModelRoot): void {
        const isCacheEmpty = this.isCacheEmpty();
        this.cachedPopup = model;
        if (isCacheEmpty)
            this.scheduleUpdate();
    }

    update(model: SModelRoot): void {
        const isCacheEmpty = this.isCacheEmpty();
        this.cachedModelRoot = model;
        if (isCacheEmpty)
            this.scheduleUpdate();
    }

    updateHidden(hiddenModel: SModelRoot): void {
        const isCacheEmpty = this.isCacheEmpty();
        this.cachedHiddenModelRoot = hiddenModel;
        if (isCacheEmpty)
            this.scheduleUpdate();
    }

    protected scheduleUpdate() {
        this.syncer.onEndOfNextFrame(() => {
            if (this.cachedHiddenModelRoot) {
                const nextHiddenModelRoot = this.cachedHiddenModelRoot;
                this.delegate.updateHidden(nextHiddenModelRoot);
                this.cachedHiddenModelRoot = undefined;
            }
            if (this.cachedModelRoot) {
                const nextModelRoot = this.cachedModelRoot;
                this.delegate.update(nextModelRoot);
                this.cachedModelRoot = undefined;
            }
            if (this.cachedPopup) {
                const nextModelRoot = this.cachedPopup;
                this.delegate.updatePopup(nextModelRoot);
                this.cachedPopup = undefined;
            }
        });
    }
}
