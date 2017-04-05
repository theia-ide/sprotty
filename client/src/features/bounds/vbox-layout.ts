
import { SParentElement } from "../../base/model/smodel"
import { Layout } from "./layout"
import { isLayouting } from "./model"
import { Bounds, isEmpty } from "../../utils/geometry"
import { Map } from "../../utils/utils"

/**
 * CSS properties understood by the VBoxLayouter
 */
interface VBoxProperties {
    lineHeight: number
    paddingTop: number
    paddingBottom: number
    paddingLeft: number
    paddingRight: number
    textAlign: string
}

export class VBoxLayouter implements Layout {
    static KIND = 'vbox'

    layout(container: SParentElement, domElement: Node | undefined, element2bounds: Map<Bounds>): void {
        if (isLayouting(container)) {
            const properties = this.getLayoutProperties(domElement)
            let maxWidth = -1
            container.children.forEach(
                child => {
                    const bounds = element2bounds[child.id] || (child as any).bounds
                    if (bounds && !isEmpty(bounds))
                        maxWidth = Math.max(maxWidth, bounds.width)
                }
            )
            if (maxWidth > 0) {
                let y = properties.paddingTop
                container.children.forEach(
                    child => {
                        const bounds = element2bounds[child.id] || (child as any).bounds
                        if (bounds && !isEmpty(bounds)) {
                            let dx = 0
                            if(properties.textAlign == 'left')
                                dx = 0
                            else if(properties.textAlign == 'center')
                                dx = 0.5 * (maxWidth - bounds.width)
                            else if(properties.textAlign == 'right')
                                dx = maxWidth - bounds.width
                            element2bounds[child.id] = {
                                x: properties.paddingLeft + (child as any).bounds.x - bounds.x + dx,
                                y: y + (child as any).bounds.y - bounds.y,
                                width: bounds.width,
                                height: bounds.height
                            }
                            y += bounds.height + properties.lineHeight
                        }
                    }
                )
                const boundsFromDiagram = element2bounds[container.id]
                element2bounds[container.id] = {
                    x: container.bounds.x,
                    y: container.bounds.y,
                    width: maxWidth + properties.paddingLeft + properties.paddingRight,
                    height: y - properties.lineHeight + properties.paddingBottom
                }
            }
        }
    }

    protected getLayoutProperties(domElement: any): VBoxProperties {
        const style = (domElement) ? getComputedStyle(domElement) : undefined
        return {
            lineHeight: this.getFloatValue(style, 'line-height', 3),
            paddingTop: this.getFloatValue(style, 'padding-top', 5),
            paddingBottom: this.getFloatValue(style, 'padding-bottom', 5),
            paddingLeft: this.getFloatValue(style, 'padding-left', 5),
            paddingRight: this.getFloatValue(style, 'padding-right', 5),
            textAlign: this.getStringValue(style, 'text-align', 'center')
        }
    }

    protected getFloatValue(style: CSSStyleDeclaration | undefined, property: string, defaultValue: number): number {
        if(style) {
            const stringVal = style.getPropertyValue(property)
            if(stringVal) {
                const floatVal = parseFloat(stringVal)
                if(!isNaN(floatVal)) {
                    return floatVal
                }
            }
        }
        return defaultValue
    }

    protected getStringValue(style: CSSStyleDeclaration | undefined, property: string, defaultValue: string): string {
        if(style) {
            const stringVal = style.getPropertyValue(property)
            if(stringVal)
                return stringVal
        }
        return defaultValue
    }
}