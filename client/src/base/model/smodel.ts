/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Bounds, EMPTY_BOUNDS, Point, isBounds } from "../../utils/geometry"

/**
 * The schema of an SModelElement describes its serializable form. The actual model is created from
 * its schema with an IModelFactory.
 * Each model element must have a unique ID and a type that is used to look up its view.
 */
export interface SModelElementSchema {
    type: string
    id: string
    children?: SModelElementSchema[]
}

/**
 * Serializable schema for the root element of the model tree.
 */
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

    /**
     * A feature is a symbol identifying some functionality that can be enabled or disabled for
     * a model element. The base implementation always returns false, so it disables all features.
     */
    hasFeature(feature: symbol): boolean {
        return false
    }
}

/**
 * A parent element may contain child elements, thus the diagram model forms a tree.
 */
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

    /**
     * Transform the given bounds from the local coordinate system of this element to the coordinate
     * system of its parent. This function should consider any transformation that is applied to the
     * view of this element and its contents.
     * The base implementation assumes that this element does not define a local coordinate system,
     * so it leaves the bounds unchanged.
     */
    localToParent(point: Point | Bounds): Bounds {
        return isBounds(point) ? point : { x: point.x, y: point.y, width: -1, height: -1 }
    }

    /**
     * Transform the given bounds from the coordinate system of this element's parent to its local
     * coordinate system. This function should consider any transformation that is applied to the
     * view of this element and its contents.
     * The base implementation assumes that this element does not define a local coordinate system,
     * so it leaves the bounds unchanged.
     */
    parentToLocal(point: Point | Bounds): Bounds {
        return isBounds(point) ? point : { x: point.x, y: point.y, width: -1, height: -1 }
    }
}

/**
 * A child element is contained in a parent element. All elements except the model root are child
 * elements. In order to keep the model class hierarchy simple, every child element is also a
 * parent element, although for many elements the array of children is empty (i.e. they are
 * leafs in the model element tree).
 */
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
