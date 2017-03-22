import "reflect-metadata"
import {injectable} from "inversify"

export interface Map<T> {
    [key: string]: T
}

@injectable()
export class ProviderRegistry<T, U> {
    protected elements: Map<new(U) => T> = {}

    register(key: string, cstr: new (U) => T) {
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

    register(key: string, cstr: T) {
        this.elements[key] = cstr
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

/**
 * Returns whether the mouse or keyboard event includes the CMD key
 * on Mac or CTRL key on Linux / others
 */
export function isCtrlOrCmd(event: KeyboardEvent | MouseEvent) {
    if (isMac())
        return event.metaKey
    else
        return event.ctrlKey
}

export function isMac(): boolean {
    return window.navigator.userAgent.indexOf("Mac") != -1
}