/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";

@injectable()
export class ProviderRegistry<T, U> {
    protected elements: Map<string, new(u: U) => T> = new Map;

    register(key: string, cstr: new (u: U) => T) {
        if (key === undefined)
            throw new Error('Key is undefined');
        if (this.hasKey(key))
            throw new Error('Key is already registered: ' + key);
        this.elements.set(key, cstr);
    }

    deregister(key: string) {
        if (key === undefined)
            throw new Error('Key is undefined');
        this.elements.delete(key);
    }

    hasKey(key: string): boolean {
        return this.elements.has(key);
    }

    get(key: string, arg: U): T {
        const existingCstr = this.elements.get(key);
        if (existingCstr)
            return new existingCstr(arg);
        else
            return this.missing(key, arg);
    }

    protected missing(key: string, arg: U): T | never {
        throw new Error('Unknown registry key: ' + key);
    }
}

@injectable()
export class InstanceRegistry<T> {
    protected elements: Map<string, T> = new Map;

    register(key: string, instance: T) {
        if (key === undefined)
            throw new Error('Key is undefined');
        if (this.hasKey(key))
            throw new Error('Key is already registered: ' + key);
        this.elements.set(key, instance);
    }

    deregister(key: string) {
        if (key === undefined)
            throw new Error('Key is undefined');
        this.elements.delete(key);
    }

    hasKey(key: string): boolean {
        return this.elements.has(key);
    }

    get(key: string): T {
        const existingInstance = this.elements.get(key);
        if (existingInstance)
            return existingInstance;
        else
            return this.missing(key);
    }

    protected missing(key: string): T | never {
        throw new Error('Unknown registry key: ' + key);
    }
}

@injectable()
export class MultiInstanceRegistry<T> {
    protected elements: Map<string, T[]> = new Map;

    register(key: string, instance: T) {
        if (key === undefined)
            throw new Error('Key is undefined');
        const instances = this.elements.get(key);
        if (instances !== undefined)
            instances.push(instance);
        else
            this.elements.set(key, [instance]);
    }

    deregisterAll(key: string) {
        if (key === undefined)
            throw new Error('Key is undefined');
        this.elements.delete(key);
    }

    get(key: string): T[] {
        const existingInstances = this.elements.get(key);
        if (existingInstances !== undefined)
            return existingInstances;
        else
            return [];
    }
}
