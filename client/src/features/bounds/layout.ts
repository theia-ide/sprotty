import { InstanceRegistry } from "../../utils/registry"
import { SParentElement, SModelElement } from "../../base/model/smodel"
import { isLayouting, Layouting } from "./model"
import { Bounds } from "../../utils/geometry"
import { inject, injectable } from "inversify"
import { LAYOUT_TYPES } from "./types"
import { BoundsData } from "./bounds-updater"
import { VBoxLayouter } from "./vbox-layout"

export class LayoutRegistry extends InstanceRegistry<ILayout> {
    constructor() {
        super()
        this.register(VBoxLayouter.KIND, new VBoxLayouter())
    }
}

@injectable()
export class Layouter {

    constructor(@inject(LAYOUT_TYPES.LayoutRegistry) protected layoutRegistry: LayoutRegistry) {}

    layout(element2boundsData: Map<SModelElement​​, BoundsData>) {
        element2boundsData.forEach(
            (boundsData, element) => {
                if (isLayouting(element)) {
                    const layout = this.layoutRegistry.get(element.layout)
                    if(layout)
                        layout.layout(element, element2boundsData)
                }
            })
    }
}

export interface ILayout {
    layout(container: Layouting & SParentElement, element2boundsData: Map<SModelElement, BoundsData>): void
}
