import { SChildElement, SModelElement } from "../base/model/smodel"

export function findTargetByFeature<T>(target: SModelElement, checkFeature: (t: SModelElement) => t is SModelElement & T): SModelElement & T | undefined {
    let current: SModelElement | undefined = target

    while (current !== undefined) {
        if (checkFeature(current))
            return current
        else if (current instanceof SChildElement)
            current = current.parent
        else
            current = undefined
    }

    return current
}