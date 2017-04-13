import { injectable } from "inversify"
import {
    SChildElement, SModelElement, SModelElementSchema, SModelIndex, SModelRoot, SModelRootSchema, SParentElement
} from "./smodel"

export interface IModelFactory {
    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement

    createRoot(schema: SModelRootSchema): SModelRoot
}

export const RESERVED_MODEL_PROPERTIES = ['children', 'index', '_index', 'root', 'parent']

@injectable()
export class SModelFactory implements IModelFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        return this.initializeChild(new SChildElement(), schema, parent)
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        return this.initializeRoot(new SModelRoot(), schema)
    }

    protected initializeElement(elem: SModelElement, schema: SModelElementSchema): SModelElement {
        for (let key in schema) {
            if (RESERVED_MODEL_PROPERTIES.indexOf(key) < 0 && key in schema) {
                const value: any = (schema as any)[key]
                if (typeof value != 'function')
                    (elem as any)[key] = value
            }
        }
        return elem
    }

    protected initializeParent(parent: SParentElement, schema: SModelElementSchema): SParentElement {
        this.initializeElement(parent, schema)
        if (schema.children !== undefined) {
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
        initializeIndex(root, root.index)
        return root
    }
}

export function initializeIndex<T extends SModelElementSchema>(element: T, index: SModelIndex<T>): void {
    if (index.contains(element)) {
        throw new Error("Duplicate ID in model: " + element.id)
    }
    index.add(element)
    if (element.children !== undefined) {
        for (const child of element.children) {
            initializeIndex(child, index)
        }
    }
}

export const EMPTY_ROOT = new SModelFactory().createRoot({
    id: 'EMPTY',
    type: 'NONE'
})
