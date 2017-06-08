/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify"
import {
    SChildElement, SModelElement, SModelElementSchema, SModelRoot, SModelRootSchema, SParentElement
} from "./smodel"

export interface IModelFactory {
    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement

    createRoot(schema: SModelRootSchema): SModelRoot

    createSchema(element: SModelElement): SModelElementSchema
}

@injectable()
export class SModelFactory implements IModelFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        return this.initializeChild(new SChildElement(), schema, parent)
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        return this.initializeRoot(new SModelRoot(), schema)
    }

    createSchema(element: SModelElement): SModelElementSchema {
        const schema = {}
        for (let key in element) {
             if (!this.isReserved(element, key)) {
                const value: any = (element as any)[key]
                if (typeof value !== 'function')
                    (schema as any)[key] = value
            }
        }
        if (element instanceof SParentElement)
            (schema as any)['children'] = element.children.map(child => this.createSchema(child))
        return schema as SModelElementSchema
    }

    protected initializeElement(element: SModelElement, schema: SModelElementSchema): SModelElement {
        for (let key in schema) {
            if (!this.isReserved(element, key)) {
                const value: any = (schema as any)[key]
                if (typeof value !== 'function')
                    (element as any)[key] = value
            }
        }
        return element
    }

    protected isReserved(element: SModelElement, propertyName: string) {
        if (['children', 'parent', 'index'].indexOf(propertyName) >= 0)
            return true
        let obj = element
        do {
            const descriptor = Object.getOwnPropertyDescriptor(obj, propertyName)
            if (descriptor !== undefined)
                return descriptor.get !== undefined
            obj = Object.getPrototypeOf(obj)
        } while (obj)
        return false
    }

    protected initializeParent(parent: SParentElement, schema: SModelElementSchema): SParentElement {
        this.initializeElement(parent, schema)
        if (schema.children !== undefined && schema.children.constructor === Array) {
            parent.children = schema.children.map(childSchema => this.createElement(childSchema, parent))
        }
        return parent
    }

    protected initializeChild(child: SChildElement, schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        this.initializeParent(child, schema)
        if (parent !== undefined) {
            child.parent = parent
        }
        return child
    }

    protected initializeRoot(root: SModelRoot, schema: SModelRootSchema): SModelRoot {
        this.initializeParent(root, schema)
        root.index.add(root)
        return root
    }
}

export const EMPTY_ROOT: Readonly<SModelRootSchema> = Object.freeze({
    type: 'NONE',
    id: 'EMPTY'
})
