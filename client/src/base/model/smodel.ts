import {Map} from "../../utils"
import {SModelElementSchema, SModelRootSchema} from "./smodel-schema"

/**
 * Base class for all elements of the diagram model.
 * The diagram model forms a tree using the parent property.
 * Each model element must have a unique ID and a type that is used to look up its view.
 */
export class SModelElement {
    readonly type: string
    readonly id: string
    children?: ChildrenList<SModelElement>
    parent?: SModelElement

    constructor(json: SModelElementSchema) {
        for (let key in json) {
            if (key != 'children' && json[key] !== undefined) {
                this[key] = json[key]
            }
        }
        if (json.children) {
            this.children = new ChildrenList<SModelElement>(this)
            json.children.forEach(child => {
                try {
                    this.children.add(this.createChild(child))
                } catch (e) {
                    console.log(e.message)
                }
            })
        }
    }

    /**
     * Create a child element for the given schema. Override this method in order to specialize created
     * element types.
     */
    protected createChild(json: SModelElementSchema): SModelElement {
        return new SModelElement(json)
    }

    get root(): SModelRoot {
        let current: SModelElement = this
        while (current) {
            if (current instanceof SModelRoot)
                return current
            else
                current = current.parent!
        }
        return undefined!
    }
}

/**
 * Base interface for the root elements of the diagram model tree.
 */
export class SModelRoot extends SModelElement {
    readonly index = new SModelIndex()

    constructor(json: SModelRootSchema) {
        super(json)
        if (this.children)
            this.children.index = this.index
    }
}

/**
 * Used to speed up model element lookup by id.
 */
export class SModelIndex {

    constructor() {
    }

    id2element: Map<SModelElement> = {}

    add(element: SModelElement) {
        this.id2element[element.id] = element
    }

    remove(element: SModelElement) {
        delete this.id2element[element.id]
    }

    removeById(elementId: string) {
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

/**
 * If a model element uses this to store its children, index and parent will be
 * automatically kept consistent.
 * Mini EMF, if you want so.
 * Note that by manually modifying the parent the corresponding children list is not updated.
 */
export class ChildrenList<T extends SModelElement> {
    private _index: SModelIndex | undefined = undefined

    constructor(private parent: SModelElement) {
    }

    private children: T[] = []

    set index(index: SModelIndex | undefined) {
        if (index) {
            index.add(this.parent)
            this.children.forEach(child => {
                this.addToIndex(child, index)
            })
        } else {
            if (this._index)
                this._index.remove(this.parent)
            this.children.forEach(child => {
                this.removeFromIndex(child)
            })
        }
        this._index = index
    }

    private addToIndex(child: SModelElement, index: SModelIndex | undefined) {
        if (child.children)
            child.children.index = index
        else if (index)
            index.add(child)
    }

    private removeFromIndex(child: SModelElement) {
        if (child.children)
            child.children.index = undefined
        else if (this._index)
            this._index.remove(child)
    }

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
        this.addToIndex(child, this._index)
    }

    remove(child: T) {
        const i = this.indexOf(child)
        if (i < 0) {
            throw "No such child " + child
        }
        this.children.splice(i, 1)
        this.removeFromIndex(child)
    }

    indexOf(child: T): number {
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

    get(i: number): T {
        return this.children[i]
    }
}

export const EMPTY_ROOT = new SModelRoot({
    id: 'EMPTY',
    type: 'NONE'
})
