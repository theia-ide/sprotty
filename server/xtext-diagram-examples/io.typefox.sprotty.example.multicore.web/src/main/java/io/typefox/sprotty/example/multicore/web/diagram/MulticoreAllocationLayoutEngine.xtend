/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web.diagram

import io.typefox.sprotty.api.SEdge
import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.layout.ElkLayoutEngine
import io.typefox.sprotty.layout.SprottyLayoutConfigurator
import java.io.ByteArrayOutputStream
import java.util.Map
import org.apache.log4j.Logger
import org.eclipse.elk.alg.layered.options.LayeredOptions
import org.eclipse.elk.alg.layered.options.NodeFlexibility
import org.eclipse.elk.alg.layered.options.NodePlacementStrategy
import org.eclipse.elk.core.math.KVector
import org.eclipse.elk.core.options.CoreOptions
import org.eclipse.elk.core.options.Direction
import org.eclipse.elk.core.options.PortConstraints
import org.eclipse.elk.core.options.PortSide
import org.eclipse.elk.core.options.SizeConstraint
import org.eclipse.elk.graph.ElkConnectableShape
import org.eclipse.elk.graph.ElkEdge
import org.eclipse.elk.graph.ElkNode
import org.eclipse.elk.graph.util.ElkGraphUtil
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl

class MulticoreAllocationLayoutEngine extends ElkLayoutEngine {
	
	static val LOG = Logger.getLogger(MulticoreAllocationLayoutEngine)
	
	override layout(SModelRoot root) {
		if (root instanceof SGraph) {
			val configurator = new SprottyLayoutConfigurator
			configurator.configureByType('flow')
				.setProperty(CoreOptions.DIRECTION, Direction.DOWN)
				.setProperty(CoreOptions.SPACING_NODE_NODE, 40.0)
				.setProperty(CoreOptions.SPACING_EDGE_NODE, 25.0)
				.setProperty(LayeredOptions.SPACING_EDGE_NODE_BETWEEN_LAYERS, 20.0)
				.setProperty(LayeredOptions.SPACING_NODE_NODE_BETWEEN_LAYERS, 30.0)
				.setProperty(LayeredOptions.NODE_PLACEMENT_STRATEGY, NodePlacementStrategy.NETWORK_SIMPLEX)
			configurator.configureByType('task')
				.setProperty(CoreOptions.NODE_SIZE_CONSTRAINTS, SizeConstraint.minimumSize())
				.setProperty(CoreOptions.NODE_SIZE_MINIMUM, new KVector(40, 40))
			configurator.configureByType('barrier')
				.setProperty(CoreOptions.NODE_SIZE_CONSTRAINTS, SizeConstraint.free())
				.setProperty(CoreOptions.NODE_SIZE_MINIMUM, new KVector(50, 20))
				.setProperty(CoreOptions.PORT_CONSTRAINTS, PortConstraints.FIXED_ORDER)
				.setProperty(LayeredOptions.NODE_PLACEMENT_NETWORK_SIMPLEX_NODE_FLEXIBILITY, NodeFlexibility.NODE_SIZE)
			layout(root, configurator)
		}
	}
	
	override protected resolveReferences(ElkEdge elkEdge, SEdge sedge, Map<String, ElkConnectableShape> id2NodeMap, LayoutContext context) {
		val source = id2NodeMap.get(sedge.sourceId)
		if (source instanceof ElkNode) {
			val index = if (sedge instanceof FlowEdge) sedge.sourceIndex
			if (index === null)
				elkEdge.sources.add(source)
			else {
				val port = factory.createElkPort
				port.parent = source
				port.setProperty(CoreOptions.PORT_SIDE, PortSide.SOUTH)
				port.setProperty(CoreOptions.PORT_INDEX, index)
				elkEdge.sources.add(port)
			}
		}
		val target = id2NodeMap.get(sedge.targetId)
		if (target instanceof ElkNode) {
			val index = if (sedge instanceof FlowEdge) sedge.targetIndex
			if (index === null)
				elkEdge.targets.add(target)
			else {
				val port = factory.createElkPort
				port.parent = target
				port.setProperty(CoreOptions.PORT_SIDE, PortSide.NORTH)
				port.setProperty(CoreOptions.PORT_INDEX, index)
				elkEdge.targets.add(port)
			}
		}
		val container = ElkGraphUtil.findBestEdgeContainment(elkEdge)
		if (container !== null)
			elkEdge.containingNode = container
		else
			elkEdge.containingNode = context.elkGraph
	}
	
	override protected applyEngine(ElkNode elkGraph) {
		if (LOG.isTraceEnabled)
			LOG.trace(elkGraph.toXMI)
		super.applyEngine(elkGraph)
	}
	
	private def toXMI(ElkNode elkGraph) {
		val resourceSet = new ResourceSetImpl
		val resource = resourceSet.createResource(URI.createFileURI('output.elkg'))
		resource.contents += elkGraph
		val outputStream = new ByteArrayOutputStream
		resource.save(outputStream, emptyMap)
		return outputStream.toString
	}
	
}