package io.typefox.sprotte.example.flow.web.diagram

import io.typefox.sprotte.api.SGraph
import io.typefox.sprotte.api.SNode
import org.eclipse.lsp4j.generator.JsonRpcData
import org.eclipse.xtext.web.server.IServiceResult

@JsonRpcData
class Program extends SGraph implements IServiceResult {
}

@JsonRpcData
class ExecutionNode extends SNode {
	String taskName
}

@JsonRpcData
class BarrierNode extends SNode {
}
