import { injectable } from "inversify"
import { Map } from "./utils"

@injectable()
export class ProviderRegistry<T, U> {
    protected elements: Map<new(U) => T> = {}

    register(key: string, cstr: new (U) => T) {
        if (this.hasKey(key))
            throw new Error('Key is already registered: ' + key)
        this.elements[key] = cstr
    }

    deregister(key: string) {
        delete this.elements[key]
    }

    hasKey(key: string): boolean {
        return this.elements.hasOwnProperty(key)
    }

    get(key: string, arg: U): T {
        if (this.hasKey(key))
            return new this.elements[key](arg)
        else
            return this.missing(key, arg)
    }

    protected missing(key: string, arg: U): T {
        throw new Error('Unknown registry key: ' + key)
    }
}

@injectable()
export class InstanceRegistry<T> {
    protected elements: Map<T> = {}

    register(key: string, instance: T) {
        if (this.hasKey(key))
            throw new Error('Key is already registered: ' + key)
        this.elements[key] = instance
    }

    deregister(key: string) {
        delete this.elements[key]
    }

    hasKey(key: string): boolean {
        return this.elements.hasOwnProperty(key)
    }

    get(key: string): T {
        if (this.hasKey(key))
            return this.elements[key]
        else
            return this.missing(key)
    }

    protected missing(key: string): T {
        throw new Error('Unknown registry key: ' + key)
    }
}

@injectable()
export class MultiInstanceRegistry<T> {
    protected elements: Map<T[]> = {}

    register(key: string, instance: T) {
        if (this.elements.hasOwnProperty(key))
            this.elements[key].push(instance)
        else
            this.elements[key] = [instance]
    }

    deregisterAll(key: string) {
        delete this.elements[key]
    }

    get(key: string): T[] {
        if (this.elements.hasOwnProperty(key))
            return this.elements[key]
        else
            return []
    }
}
