import "reflect-metadata"
import { injectable } from "inversify"
import {
    SModelElementSchema, SModelElement, SModelRootSchema, SModelRoot, SParentElementSchema, SParentElement,
    SChildElement, SModelIndex
} from "./smodel"

export interface IModelFactory {
    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement

    createRoot(schema: SModelRootSchema): SModelRoot
}

@injectable()
export class SModelFactory implements IModelFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        if (schema instanceof SChildElement) {
            if (parent !== undefined)
                schema.parent = parent
            return schema
        } else
            return this.initializeChild(new SChildElement(), schema, parent)
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        if (schema instanceof SModelRoot)
            return schema
        else
            return this.initializeRoot(new SModelRoot(), schema)
    }

    protected initializeElement(elem: SModelElement, schema: SModelElementSchema): SModelElement {
        for (let key in schema) {
            if (key != 'children' && key != 'index' && schema[key] !== undefined) {
                elem[key] = schema[key]
            }
        }
        return elem
    }

    protected initializeParent(parent: SParentElement, schema: SParentElementSchema): SParentElement {
        this.initializeElement(parent, schema)
        if (schema.children) {
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
        this.initializeIndex(root, root.index)
        return root
    }

    private initializeIndex(parent: SParentElement, index: SModelIndex): void {
        parent.children.forEach(child => {
            if (index.contains(child)) {
                throw new Error("Duplicate ID in model: " + child.id)
            }
            index.add(child)
            if (child.children.length > 0) {
                this.initializeIndex(child, index)
            }
        })
    }
}

export const EMPTY_ROOT = new SModelFactory().createRoot({
    id: 'EMPTY',
    type: 'NONE'
})
