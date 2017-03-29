package io.typefox.sprotty.example.multicore.web.diagram

import io.typefox.sprotty.api.SEdge
import io.typefox.sprotty.layout.ElkLayoutEngine
import java.util.Map
import org.eclipse.elk.core.options.CoreOptions
import org.eclipse.elk.core.options.PortSide
import org.eclipse.elk.graph.ElkEdge
import org.eclipse.elk.graph.ElkNode
import org.eclipse.elk.graph.util.ElkGraphUtil

class MulticoreAllocationLayoutEngine extends ElkLayoutEngine {
	
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
	
}