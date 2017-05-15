package io.typefox.sprotty.example.multicore.web.diagram

import io.typefox.sprotty.api.SEdge
import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.api.SNode
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.ToString

@Accessors@ToString
class Flow extends SGraph {
}

@Accessors@ToString
class TaskNode extends SNode {
	String name
	String status
	Boolean selected
	int kernelNr
}

@Accessors@ToString
class BarrierNode extends SNode {
	String name	
}

@Accessors@ToString
class FlowEdge extends SEdge {
	transient Integer sourceIndex
	transient Integer targetIndex
}
