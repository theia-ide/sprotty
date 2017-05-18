/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web.diagram

import io.typefox.sprotty.api.SEdge
import io.typefox.sprotty.layout.ElkLayoutEngine
import java.io.ByteArrayOutputStream
import java.util.Map
import org.apache.log4j.Logger
import org.eclipse.elk.core.options.CoreOptions
import org.eclipse.elk.core.options.PortSide
import org.eclipse.elk.graph.ElkEdge
import org.eclipse.elk.graph.ElkNode
import org.eclipse.elk.graph.util.ElkGraphUtil
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl

class MulticoreAllocationLayoutEngine extends ElkLayoutEngine {
	
	static val LOG = Logger.getLogger(MulticoreAllocationLayoutEngine)
	
	override protected resolveReferences(ElkEdge elkEdge, SEdge sedge, Map<String, ElkNode> id2NodeMap, LayoutContext context) {
		val source = id2NodeMap.get(sedge.sourceId)
		if (source !== null) {
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
		if (target !== null) {
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