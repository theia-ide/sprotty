import {Map} from "../../utils"
import {SModelFactory} from "./smodel-factory"

export interface SModelElementSchema {
    type: string
    id: string
}

/**
 * Base class for all elements of the diagram model.
 * Each model element must have a unique ID and a type that is used to look up its view.
 */
export class SModelElement implements SModelElementSchema {
    type: string
    id: string

    get root(): SModelRoot {
        let current: SModelElement | undefined = this
        while (current) {
            if (current instanceof SModelRoot)
                return current
            else if (current instanceof SChildElement)
                current = current.parent
            else
                current = undefined
        }
        throw new Error("Element has no root")
    }

    get index(): SModelIndex {
        return this.root.index
    }
}

export interface SParentElementSchema extends SModelElementSchema {
    children?: SModelElementSchema[]
}

export class SParentElement extends SModelElement implements SParentElementSchema {
    children: SChildElement[] = []

    add(child: SChildElement, i?: number) {
        if (i === undefined) {
            this.children.push(child)
        } else {
            if (i < 0 || i > this.children.length) {
                throw "Child index out of bounds " + i + " (0.." + this.children.length + ")"
            }
            this.children.splice(i, 0, child)
        }
        child.parent = this
        this.index.add(child)
    }

    remove(child: SChildElement) {
        const i = this.children.indexOf(child)
        if (i < 0) {
            throw "No such child " + child
        }
        this.children.splice(i, 1)
        this.index.remove(child)
    }

    move(child: SChildElement, newIndex: number) {
        const i = this.children.indexOf(child)
        if (i == -1) {
            throw "No such child " + child
        } else {
            if (newIndex < 0 || newIndex > this.children.length - 1) {
                throw "Child index out of bounds " + i + " (0.." + this.children.length + ")"
            }
            this.children.splice(i, 1)
            this.children.splice(newIndex, 0, child)
        }
    }
}

export class SChildElement extends SParentElement {
    parent: SParentElement
}

export interface SModelRootSchema extends SParentElementSchema {
}

/**
 * Base class for the root elements of the diagram model tree.
 */
export class SModelRoot extends SParentElement implements SModelRootSchema {
    private _index: SModelIndex

    get index(): SModelIndex {
        if (!this._index) {
            this._index = new SModelIndex
            this._index.add(this)
        }
        return this._index
    }
}

/**
 * Used to speed up model element lookup by id.
 */
export class SModelIndex {

    private id2element: Map<SModelElement> = {}

    add(element: SModelElement): void {
        this.id2element[element.id] = element
    }

    remove(element: SModelElement): void {
        delete this.id2element[element.id]
    }

    contains(element: SModelElement): boolean {
        return this.id2element[element.id] !== undefined
    }

    removeById(elementId: string): void {
        delete this.id2element[elementId]
    }

    getById(id: string): SModelElement | undefined {
        return this.id2element[id]
    }

    all(): SModelElement[] {
        const all: SModelElement[] = []
        for (let key in this.id2element) {
            all.push(this.id2element[key])
        }
        return all
    }
}

export namespace SModel {

    export function getBasicType(schema: SModelElementSchema): string {
        if (!schema.type)
            return ''
        let colonIndex = schema.type.indexOf(':')
        if (colonIndex >= 0)
            return schema.type.substring(0, colonIndex)
        else
            return schema.type
    }

    export function getParent<T>(element: SModelElement | T, predicate: (SModelElement) => boolean): (SModelElement & T) | undefined {
        if (predicate.call(undefined, element))
            return element as (SModelElement & T)
        else if (element instanceof SChildElement) {
            const parent = element.parent
            if (parent)
                return getParent<T>(parent, predicate)
        }
        return undefined
    }

    export const EMPTY_ROOT = new SModelFactory().createRoot({
        id: 'EMPTY',
        type: 'NONE'
    })
}
