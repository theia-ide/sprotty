package io.typefox.sprotte.example.flow.web.diagram

import io.typefox.sprotte.api.GModelRoot
import io.typefox.sprotte.api.GNode
import org.eclipse.lsp4j.generator.JsonRpcData

@JsonRpcData
class Program extends GModelRoot {
}

@JsonRpcData
class Execution extends GNode {
	String taskName
}
