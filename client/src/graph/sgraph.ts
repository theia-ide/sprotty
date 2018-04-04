/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SChildElement, SModelElementSchema, SModelRootSchema, SModelIndex, SModelElement } from '../base/model/smodel'
import {
    boundsFeature, layoutContainerFeature, layoutableChildFeature, Alignable, alignFeature, ModelLayoutOptions
} from '../features/bounds/model'
import { Fadeable, fadeFeature } from '../features/fade/model'
import { Hoverable, hoverFeedbackFeature, popupFeature } from '../features/hover/model'
import { moveFeature } from '../features/move/model'
import { Selectable, selectFeature } from '../features/select/model'
import { ViewportRootElement } from '../features/viewport/viewport-root'
import { Bounds, ORIGIN_POINT, Point } from '../utils/geometry'
import { SShapeElement, SShapeElementSchema } from '../features/bounds/model'
import { editFeature, Routable } from '../features/edit/model'

/**
 * Serializable schema for graph-like models.
 */
export interface SGraphSchema extends SModelRootSchema {
    children: SModelElementSchema[]
    bounds?: Bounds
    scroll?: Point
    zoom?: number
    layoutOptions?: ModelLayoutOptions
}

/**
 * Root element for graph-like models.
 */
export class SGraph extends ViewportRootElement {
    layoutOptions?: ModelLayoutOptions

    constructor(index = new SGraphIndex()) {
        super(index)
    }
}

/**
 * Serializable schema for SNode.
 */
export interface SNodeSchema extends SShapeElementSchema {
    layout?: string
    selected?: boolean
    hoverFeedback?: boolean
    opacity?: number
}

/**
 * Model element class for nodes, which are connectable entities in a graph. A node can be connected to
 * another node via an SEdge. Such a connection can be direct, i.e. the node is the source or target of
 * the edge, or indirect through a port, i.e. it contains an SPort which is the source or target of the edge.
 */
export class SNode extends SShapeElement implements Selectable, Fadeable, Hoverable {
    children: SChildElement[]
    layout?: string
    selected: boolean = false
    hoverFeedback: boolean = false
    opacity: number = 1

    hasFeature(feature: symbol): boolean {
        return feature === selectFeature || feature === moveFeature || feature === boundsFeature
            || feature === layoutContainerFeature || feature === fadeFeature || feature === hoverFeedbackFeature
            || feature === popupFeature
    }

    get incomingEdges(): Iterable<SEdge> {
        return (this.index as SGraphIndex).getIncomingEdges(this)
    }

    get outgoingEdges(): Iterable<SEdge> {
        return (this.index as SGraphIndex).getOutgoingEdges(this)
    }
}

/**
 * Serializable schema for SPort.
 */
export interface SPortSchema extends SShapeElementSchema {
    selected?: boolean
    opacity?: number
}

/**
 * A port is a connection point for edges. It should always be contained in an SNode.
 */
export class SPort extends SShapeElement implements Selectable, Fadeable, Hoverable {
    hoverFeedback: boolean = false
    selected: boolean = false
    opacity: number = 1

    hasFeature(feature: symbol): boolean {
        return feature === selectFeature || feature === boundsFeature || feature === fadeFeature
            || feature === hoverFeedbackFeature
    }
}

/**
 * Serializable schema for SEdge.
 */
export interface SEdgeSchema extends SModelElementSchema {
    sourceId: string
    targetId: string
    routingPoints?: Point[]
    opacity?: number
}
export interface SEdgeAnchorsSchema {
    sourceAnchor: Point
    targetAnchor: Point
}

/**
 * Model element class for edges, which are the connectors in a graph. An edge has a source and a target,
 * each of which can be either a node or a port. The source and target elements are referenced via their
 * ids and can be resolved with the index stored in the root element.
 */
export class SEdge extends SChildElement implements Fadeable, Selectable, Routable, Hoverable {
    hoverFeedback: boolean = false
    sourceId: string
    targetId: string
    routingPoints: Point[] = []
    opacity: number = 1
    selected: boolean = false

    get source(): SNode | SPort | undefined {
        return this.index.getById(this.sourceId) as SNode | SPort
    }

    get target(): SNode | SPort | undefined {
        return this.index.getById(this.targetId) as SNode | SPort
    }

    hasFeature(feature: symbol): boolean {
        return feature === fadeFeature || feature === selectFeature ||
            feature === editFeature || feature === hoverFeedbackFeature
    }
}

/**
 * Serializable schema for SLabel.
 */
export interface SLabelSchema extends SShapeElementSchema {
    text: string
    selected?: boolean
}

/**
 * A label can be attached to a node, edge, or port, and contains some text to be rendered in its view.
 */
export class SLabel extends SShapeElement implements Selectable, Alignable, Fadeable {
    text: string
    selected: boolean = false
    alignment: Point = ORIGIN_POINT
    opacity = 1

    hasFeature(feature: symbol) {
        return feature === boundsFeature || feature === alignFeature || feature === fadeFeature || feature === layoutableChildFeature
    }
}

/**
 * Serializable schema for SCompartment.
 */
export interface SCompartmentSchema extends SShapeElementSchema {
    layout?: string
}

/**
 * A compartment is used to group multiple child elements such as labels of a node. Usually a `vbox`
 * or `hbox` layout is used to arrange these children.
 */
export class SCompartment extends SShapeElement implements Fadeable {
    children: SChildElement[]
    layout?: string
    layoutOptions?: {[key: string]: string | number | boolean}
    opacity = 1

    hasFeature(feature: symbol) {
        return feature === boundsFeature || feature === layoutContainerFeature || feature === layoutableChildFeature || feature === fadeFeature
    }
}

/**
 * A specialized model index that tracks outgoing and incoming edges.
 */
export class SGraphIndex extends SModelIndex<SModelElement> {

    private outgoing: Map<string, SEdge[]> = new Map
    private incoming: Map<string, SEdge[]> = new Map

    add(element: SModelElement): void {
        super.add(element)
        if (element instanceof SEdge) {
            // Register the edge in the outgoing map
            if (element.sourceId) {
                const sourceArr = this.outgoing.get(element.sourceId)
                if (sourceArr === undefined)
                    this.outgoing.set(element.sourceId, [element])
                else
                    sourceArr.push(element)
            }
            // Register the edge in the incoming map
            if (element.targetId) {
                const targetArr = this.incoming.get(element.targetId)
                if (targetArr === undefined)
                    this.incoming.set(element.targetId, [element])
                else
                    targetArr.push(element)
            }
        }
    }

    remove(element: SModelElement): void {
        super.remove(element)
        if (element instanceof SEdge) {
            // Remove the edge from the outgoing map
            const sourceArr = this.outgoing.get(element.sourceId)
            if (sourceArr !== undefined) {
                const index = sourceArr.indexOf(element)
                if (index >= 0) {
                    if (sourceArr.length === 1)
                        this.outgoing.delete(element.sourceId)
                    else
                        sourceArr.splice(index, 1)
                }
            }
            // Remove the edge from the incoming map
            const targetArr = this.incoming.get(element.targetId)
            if (targetArr !== undefined) {
                const index = targetArr.indexOf(element)
                if (index >= 0) {
                    if (targetArr.length === 1)
                        this.incoming.delete(element.targetId)
                    else
                        targetArr.splice(index, 1)
                }
            }
        }
    }

    getAttachedElements(element: SModelElement): SModelElement[] {
        const result: SModelElement[] = []
        const outgoing = this.outgoing.get(element.id)
        if (outgoing !== undefined) {
            outgoing.forEach(e => result.push(e))
        }
        const incoming = this.incoming.get(element.id)
        if (incoming !== undefined) {
            incoming.forEach(e => {
                if (outgoing === undefined || outgoing.indexOf(e) < 0) {
                    result.push(e)
                }
            })
        }
        return result
    }

    getIncomingEdges(node: SNode): Iterable<SEdge> {
        return this.incoming.get(node.id) || []
    }

    getOutgoingEdges(node: SNode): Iterable<SEdge> {
        return this.outgoing.get(node.id) || []
    }

}
