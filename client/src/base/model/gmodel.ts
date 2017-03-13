import {Map} from "../../utils"
import {GModelElementSchema, GModelRootSchema} from "./gmodel-schema"

/**
 * Base class for all elements of the diagram model.
 * The diagram model forms a tree using the parent property.
 * Each model element must have a unique ID and a type that is used to look up its view.
 */
export class GModelElement {
    readonly type: string
    readonly id: string
    childrenList?: ChildrenList<GModelElement>
    parent?: GModelElement

    constructor(json: GModelElementSchema) {
        for (let key in json) {
            if (key != 'children' && json[key] !== undefined) {
                this[key] = json[key]
            }
        }
        if (json.children) {
            this.children = new ChildrenList<GModelElement>(this)
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
     * This getter creates the children list if it's not defined yet. Access childrenList directly
     * in order to avoid this.
     */
    get children(): ChildrenList<GModelElement> {
        if (this.childrenList === undefined)
            this.childrenList = new ChildrenList<GModelElement>(this)
        return this.childrenList
    }

    /**
     * Create a child element for the given schema. Override this method in order to specialize created
     * element types.
     */
    protected createChild(json: GModelElementSchema): GModelElement {
        return new GModelElement(json)
    }

    get root(): GModelRoot | undefined {
        let current: GModelElement | undefined = this
        while (current) {
            if (current instanceof GModelRoot)
                return current
            else
                current = current.parent
        }
        return undefined
    }
}

/**
 * Base interface for the root elements of the diagram model tree.
 */
export class GModelRoot extends GModelElement {
    readonly index = new GModelIndex()

    constructor(json: GModelRootSchema) {
        super(json)
        if (this.children)
            this.children.index = this.index
    }
}

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

    getById(id: string): GModelElement | undefined {
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
 * Note that by manually modifying the parent the corresponding children list is not updated.
 */
export class ChildrenList<T extends GModelElement> {
    private _index: GModelIndex | undefined = undefined

    constructor(private parent: GModelElement) {
    }

    private children: T[] = []

    set index(index: GModelIndex | undefined) {
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

    private addToIndex(child: GModelElement, index: GModelIndex | undefined) {
        if (child.children)
            child.children.index = index
        else if (index)
            index.add(child)
    }

    private removeFromIndex(child: GModelElement) {
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

export const EMPTY_ROOT = new GModelRoot({
    id: 'EMPTY',
    type: 'NONE'
})
