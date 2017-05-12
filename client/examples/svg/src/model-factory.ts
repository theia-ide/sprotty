import {
    getBasicType, SModelElementSchema, SParentElement, SChildElement, SModelFactory, SModelRootSchema, SModelRoot
} from "../../../src/base"
import { ShapedPreRenderedElement, ShapedPreRenderedElementSchema } from "../../../src/lib"
import { ViewportRootElement } from "../../../src/features"

export class SvgFactory extends SModelFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        if (this.isPreRenderedSchema(schema))
            return this.initializeChild(new ShapedPreRenderedElement(), schema, parent)
        else
            return super.createElement(schema, parent)
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        return this.initializeRoot(new ViewportRootElement(), schema)
    }

    isPreRenderedSchema(schema: SModelElementSchema): schema is ShapedPreRenderedElementSchema {
        return getBasicType(schema) === 'pre-rendered'
    }

}