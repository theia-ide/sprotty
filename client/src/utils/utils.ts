/**
 * Created by koehnlein on 21/02/2017.
 */

export interface Map<T> {
    [key: string]: T
}

export class EventSource<CALLBACK> {
    callbacks: CALLBACK[] = []

    register(callback: CALLBACK) {
        this.callbacks.push(callback)
    }

    deregister(callback: CALLBACK) {
        const index = this.callbacks.indexOf(callback)
        if (index != -1)
            this.callbacks.splice(index, 1)
    }
}

export class Registry<T, U> {
    private elements: Map<new(U) => T> = {}

    register(key: string, cstr: new (U) => T) {
        this.elements[key] = cstr
    }

    deregister(key: string) {
        delete this.elements[key]
    }

    get(key: string, arg: U): T {
        if (this.elements.hasOwnProperty(key))
            return new this.elements[key](arg)
        else
            throw new Error('Unknown registry key: ' + key)
    }
}