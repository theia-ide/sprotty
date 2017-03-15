package io.typefox.sprotte.api

import io.typefox.sprotte.protocolgen.JsonRPC
import java.util.List
import java.util.concurrent.CompletableFuture
import org.eclipse.lsp4j.generator.JsonRpcData
import org.eclipse.lsp4j.jsonrpc.services.JsonNotification
import org.eclipse.lsp4j.jsonrpc.services.JsonRequest
import org.eclipse.lsp4j.jsonrpc.validation.NonNull

@JsonRPC
interface DiagramServer {
	
    @JsonRequest
    def CompletableFuture<SetModelAction> requestModel(RequestModelAction params)
    
    @JsonNotification
    def void elementSelected(SelectAction params)
    
}

@JsonRPC
interface DiagramClient {
	
}

@JsonRpcData
class RequestModelAction {
	String kind = 'requestModel'
}

@JsonRpcData
class SetModelAction {
	String kind = 'setModel'
	GModelRoot newRoot
}

@JsonRpcData
class SelectAction {
	String kind = 'elementSelected'
	List<String> selectedElementsIDs
	List<String> deselectedElementsIDs
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
