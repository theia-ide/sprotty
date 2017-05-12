import { SChildElement, SModelElement, SModelElementSchema } from "../base/model/smodel"

export function getBasicType(schema: SModelElementSchema): string {
    if (!schema.type)
        return ''
    let colonIndex = schema.type.indexOf(':')
    if (colonIndex >= 0)
        return schema.type.substring(0, colonIndex)
    else
        return schema.type
}

export function getSubType(schema: SModelElementSchema): string {
    if (!schema.type)
        return ''
    let colonIndex = schema.type.indexOf(':')
    if (colonIndex >= 0)
        return schema.type.substring(colonIndex + 1)
    else
        return schema.type
}

export function findParent(element: SModelElement, predicate: (e: SModelElement) => boolean): SModelElement | undefined {
    let current: SModelElement | undefined = element
    while (current !== undefined) {
        if (predicate(current))
            return current
        else if (current instanceof SChildElement)
            current = current.parent
        else
            current = undefined
    }
    return current
}

export function findParentByFeature<T>(element: SModelElement, predicate: (t: SModelElement) => t is SModelElement & T): SModelElement & T | undefined {
    let current: SModelElement | undefined = element
    while (current !== undefined) {
        if (predicate(current))
            return current
        else if (current instanceof SChildElement)
            current = current.parent
        else
            current = undefined
    }
    return current
}
