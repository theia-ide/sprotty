import { InstanceRegistry } from "../../utils/registry"
import { SParentElement } from "../../base/model/smodel"
import { isLayouting, Layouting } from "./model"
import { Bounds } from "../../utils/geometry"
import { Map } from "../../utils/utils"
import { inject, injectable } from "inversify"
import { LAYOUT_TYPES } from "./types"
import { VNodeAndBoundsAware } from "./bounds-updater"
import { VBoxLayouter } from "./vbox-layout"

export class LayoutRegistry extends InstanceRegistry<Layout> {
    constructor() {
        super()
        this.register(VBoxLayouter.KIND, new VBoxLayouter())
    }
}

@injectable()
export class Layouter {

    @inject(LAYOUT_TYPES.LayoutRegistry) layoutRegistry: LayoutRegistry

    layout(containers: VNodeAndBoundsAware[], element2bounds: Map<Bounds>): void {
        containers.forEach(
            container => {
                if (isLayouting(container.element)) {
                    const layout = this.layoutRegistry.get(container.element.layout)
                    if(layout)
                        layout.layout(container.element, container.vnode.elm, element2bounds)
                }
            })
    }
}

export interface Layout {
    layout(container: Layouting & SParentElement, domElement: Node | undefined, element2bounds: Map<Bounds>): void
}
