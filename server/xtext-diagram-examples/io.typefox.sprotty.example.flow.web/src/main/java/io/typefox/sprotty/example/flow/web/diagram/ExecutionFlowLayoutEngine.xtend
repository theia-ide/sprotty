package io.typefox.sprotty.example.flow.web.diagram

import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.layout.ElkLayoutEngine
import org.eclipse.elk.core.options.CoreOptions
import org.eclipse.elk.core.options.Direction

class ExecutionFlowLayoutEngine extends ElkLayoutEngine {
	
	override protected createGraph(SGraph sgraph) {
		val elkGraph = super.createGraph(sgraph)
		elkGraph.setProperty(CoreOptions.DIRECTION, Direction.DOWN)
		return elkGraph
	}
	
}