import {Map} from "../../utils/Utils"

/**
 * Base interface for all elements the diagram model.
 * The diagram model forms a tree using the parent property.
 * Each model element must have a unique ID and a type that is used to look up its view.
 */
export class GModelElement {
    readonly id: string
    type: string
    children?: ChildrenList<GModelElement>
    parent?: GModelElement

    constructor(arg: Object) {
        Object.assign(this, arg)
    }

    getRoot(): GModelRoot {
        let current: GModelElement = this
        while (current) {
            if (current instanceof GModelRoot)
                return current
            else
                current = current.parent
        }
        return null
    }
}

/**
 * Base interface for the root elements of the diagram model tree.
 */
export class GModelRoot extends GModelElement {
    index: GModelIndex

    constructor(arg: Object) {
        super(arg)
    }
}

export const EMPTY_ROOT = new GModelRoot({
    id: 'EMPTY',
    type: 'NONE',
    index: undefined
})

/**
 * Used to speed up model element lookup by id.
 */
export class GModelIndex {

    constructor() {
    }

    id2element: Map<GModelElement> = {}

    add(element: GModelElement) {
        this.id2element[element.id] = element
    }

    remove(element: GModelElement) {
        delete this.id2element[element.id]
    }

    removeById(elementId: string) {
        delete this.id2element[elementId]
    }

    getById(id: string): GModelElement {
        return this.id2element[id]
    }

    all(): GModelElement[] {
        const all: GModelElement[] = []
        for (let key in this.id2element) {
            all.push(this.id2element[key])
        }
        return all
    }
}

/**
 * If a model element uses this to store its children, index and parent will be
 * automatically kept consistent.
 * Mini EMF, if you want so.
 */
export class ChildrenList<T extends GModelElement> {
    constructor(private parent: GModelElement, private index: GModelIndex) {
    }

    private children: T[] = []

    add(child: T, i?: number) {
        if (i === undefined) {
            this.children.push(child)
        } else {
            if (i < 0 || i > this.children.length) {
                throw "Child index out of bounds " + i + " (0.." + this.children.length + ")"
            }
            this.children.splice(i, 0, child)
        }
        child.parent = this.parent
        this.index.add(child)
    }

    remove(child: T) {
        const i = this.indexOf(child)
        if (i == -1) {
            throw "No such child " + child
        } else {
            this.children.splice(i, 1)
            child.parent = this.parent
            this.index.removeById(child.id)
        }
    }

    indexOf(child: T) {
        return this.children.indexOf(child)
    }

    move(child: T, newIndex: number) {
        const i = this.indexOf(child)
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

    map<U>(f: (T) => U): U[] {
        return this.children.map(f)
    }

    forEach(f: (T) => any) {
        this.children.forEach(f)
    }

    length(): number {
        return this.children.length
    }
}