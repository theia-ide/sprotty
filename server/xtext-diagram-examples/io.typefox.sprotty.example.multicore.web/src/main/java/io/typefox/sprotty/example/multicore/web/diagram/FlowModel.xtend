/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web.diagram

import io.typefox.sprotty.api.SEdge
import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.api.SNode
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.ToString

@Accessors
@ToString(skipNulls = true)
class Flow extends SGraph {
}

@Accessors
@ToString(skipNulls = true)
class TaskNode extends SNode {
	String name
	String status
	Boolean selected
	int kernelNr
}

@Accessors
@ToString(skipNulls = true)
class BarrierNode extends SNode {
	String name	
}

@Accessors
@ToString(skipNulls = true)
class FlowEdge extends SEdge {
	transient Integer sourceIndex
	transient Integer targetIndex
}
