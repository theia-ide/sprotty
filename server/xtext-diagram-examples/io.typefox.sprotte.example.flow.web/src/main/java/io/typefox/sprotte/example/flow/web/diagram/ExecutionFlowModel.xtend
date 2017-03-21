package io.typefox.sprotte.example.flow.web.diagram

import org.eclipse.lsp4j.generator.JsonRpcData
import org.eclipse.xtext.web.server.IServiceResult
import io.typefox.sprotte.api.SModelRoot
import io.typefox.sprotte.api.SNode

@JsonRpcData
class Program extends SModelRoot implements IServiceResult {
}

@JsonRpcData
class ExecutionNode extends SNode {
	String taskName
}

@JsonRpcData
class BarrierNode extends SNode {
}
