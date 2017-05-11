import { Bounds, EMPTY_BOUNDS, Point, ORIGIN_POINT, Dimension, EMPTY_DIMENSION } from "../../utils/geometry"

export interface SModelElementSchema {
    type: string
    id: string
    children?: SModelElementSchema[]
}

export interface SModelRootSchema extends SModelElementSchema {
    canvasBounds?: Bounds
}

/**
 * Base class for all elements of the diagram model.
 * Each model element must have a unique ID and a type that is used to look up its view.
 */
export class SModelElement {
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

    get index(): SModelIndex<SModelElement> {
        return this.root.index
    }

    hasFeature(feature: symbol): boolean {
        return false
    }
}

export class SParentElement extends SModelElement {
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
        delete child.parent
        this.index.remove(child)
    }

    move(child: SChildElement, newIndex: number) {
        const i = this.children.indexOf(child)
        if (i === -1) {
            throw "No such child " + child
        } else {
            if (newIndex < 0 || newIndex > this.children.length - 1) {
                throw "Child index out of bounds " + i + " (0.." + this.children.length + ")"
            }
            this.children.splice(i, 1)
            this.children.splice(newIndex, 0, child)
        }
    }

    localToParent(point: Point): Point {
        return point
    }
}

export class SChildElement extends SParentElement {
    parent: SParentElement
}

/**
 * Base class for the root element of the diagram model tree.
 */
export class SModelRoot extends SParentElement {
    readonly index: SModelIndex<SModelElement>
    
    canvasBounds: Bounds = EMPTY_BOUNDS

    constructor() {
        super()
        // Override the index property from SModelElement, which has a getter, with a data property
        Object.defineProperty(this, 'index', {
            value: new SModelIndex<SModelElement>(),
            writable: false
        })
    }
}

/**
 * Used to speed up model element lookup by id.
 */
export class SModelIndex<E extends SModelElementSchema> {

    private id2element: Map<string, E> = new Map

    add(element: E): void {
        if (this.contains(element)) {
            throw new Error("Duplicate ID in model: " + element.id)
        }
        this.id2element.set(element.id, element)
        if (element.children !== undefined && element.children.constructor === Array) {
            for (const child of element.children) {
                this.add(child as any)
            }
        }
    }

    remove(element: E): void {
        this.id2element.delete(element.id)
        if (element.children !== undefined && element.children.constructor === Array) {
            for (const child of element.children) {
                this.remove(child as any)
            }
        }
    }

    contains(element: E): boolean {
        return this.id2element.get(element.id) !== undefined
    }

    removeById(elementId: string): void {
        this.id2element.delete(elementId)
    }

    getById(id: string): E | undefined {
        return this.id2element.get(id)
    }

    all(): E[] {
        const all: E[] = []
        this.id2element.forEach(
            element => all.push(element)
        )
        return all
    }
}

export function getBasicType(schema: SModelElementSchema): string {
    if (!schema.type)
        return ''
    let colonIndex = schema.type.indexOf(':')
    if (colonIndex >= 0)
        return schema.type.substring(0, colonIndex)
    else
        return schema.type
}

export function getSubType(schema: SModelElementSchema): string {
    if (!schema.type)
        return ''
    let colonIndex = schema.type.indexOf(':')
    if (colonIndex >= 0)
        return schema.type.substring(colonIndex + 1)
    else
        return schema.type
}

export function getParent<T>(element: SModelElement | T, predicate: (e: SModelElement) => boolean): (SModelElement & T) | undefined {
    if (predicate.call(undefined, element))
        return element as (SModelElement & T)
    else if (element instanceof SChildElement) {
        const parent = element.parent
        if (parent)
            return getParent<T>(parent, predicate)
    }
    return undefined
}
