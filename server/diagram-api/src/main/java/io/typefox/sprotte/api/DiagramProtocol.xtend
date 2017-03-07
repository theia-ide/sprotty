package io.typefox.sprotte.api

import io.typefox.sprotte.protocolgen.JsonRPC
import java.util.List
import java.util.Map
import java.util.concurrent.CompletableFuture
import org.eclipse.lsp4j.generator.JsonRpcData
import org.eclipse.lsp4j.jsonrpc.services.JsonNotification
import org.eclipse.lsp4j.jsonrpc.services.JsonRequest
import org.eclipse.lsp4j.jsonrpc.validation.NonNull

@JsonRPC
interface DiagramServer {
	
    @JsonRequest
    def CompletableFuture<GModelRoot> getDiagram(GetDiagramParams params)
    
    @JsonNotification
    def void elementSelected(SelectionParams params)
    
}

@JsonRPC
interface DiagramClient {
	
}

@JsonRpcData
class GetDiagramParams {

    Map<String, String> options
    
}

@JsonRpcData
class SelectionParams {

    Map<String, String> options
    
}

@JsonRpcData
abstract class GModelElement {
	
	@NonNull String type
	
	@NonNull String id
	
	List<GModelElement> children
	
	GModelElement parent
	
}

@JsonRpcData
class GModelRoot extends GModelElement {
	
}

@JsonRpcData
class GNode extends GModelElement {
	
	int x
	
	int y
	
}

@JsonRpcData
class GEdge extends GModelElement {
	
	@NonNull String sourceId
	
	@NonNull String targetId
	
}
