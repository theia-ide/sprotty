package io.typefox.sprotty.example.multicore.web.diagram

import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.api.SNode
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.EqualsHashCode
import org.eclipse.xtend.lib.annotations.ToString

@Accessors@EqualsHashCode@ToString
class Flow extends SGraph {
}

@Accessors@EqualsHashCode@ToString
class TaskNode extends SNode {
	String kernel
}

@Accessors@EqualsHashCode@ToString
class BarrierNode extends SNode {
}
