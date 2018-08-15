/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify";
import { TYPES } from '../types';
import { ViewerOptions } from "../views/viewer-options";
import { SModelRootSchema } from './smodel';
import { EMPTY_ROOT } from './smodel-factory';

@injectable()
export class SModelStorage {

    @inject(TYPES.ViewerOptions) protected viewerOptions: ViewerOptions;

    protected localCache: Map<string, string> = new Map;

    store(root: SModelRootSchema) {
        if (this.isLocalStorageAvailable())
            localStorage.setItem(this.key, JSON.stringify(root));
        else
            this.localCache.set(this.key, JSON.stringify(root));
    }

    load(): SModelRootSchema  {
        const schema = (this.isLocalStorageAvailable())
            ? localStorage.getItem(this.key)
            : this.localCache.get(this.key);
        if (schema)
            return JSON.parse(schema) as SModelRootSchema;
        else
            return EMPTY_ROOT;
    }

    protected isLocalStorageAvailable(): boolean {
        try {
            return typeof localStorage === 'object' && localStorage !== null;
        } catch (e) {
            return false;
        }
    }

    protected get key(): string {
        return this.viewerOptions.baseDiv;
    }
}

