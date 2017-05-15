import { SGraph, SGraphSchema, SGraphFactory } from "../../../src/graph"
import { SModelElementSchema, SModelRoot, SModelRootSchema, SParentElement, SChildElement, getBasicType } from "../../../src/base"
import { HtmlRoot, HtmlRootSchema, PreRenderedElement, PreRenderedElementSchema } from "../../../src/lib"

export class ClassDiagramFactory extends SGraphFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        if (this.isPreRenderedSchema(schema))
            return this.initializeChild(new PreRenderedElement(), schema, parent)
        else
            return super.createElement(schema, parent)
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        if (this.isHtmlRootSchema(schema))
            return this.initializeRoot(new HtmlRoot(), schema)
        else
            return super.createRoot(schema)
    }

    isHtmlRootSchema(schema: SModelElementSchema): schema is HtmlRootSchema {
        return getBasicType(schema) === 'html'
    }

    isPreRenderedSchema(schema: SModelElementSchema): schema is PreRenderedElementSchema {
        return getBasicType(schema) === 'pre-rendered'
    }

}