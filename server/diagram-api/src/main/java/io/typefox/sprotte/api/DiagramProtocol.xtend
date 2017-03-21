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
    def CompletableFuture<SetModelAction> requestModel(RequestModelAction action)
    
    @JsonNotification
    def void elementSelected(SelectAction action)
    
}

@JsonRPC
interface DiagramClient {
	
}

@JsonRpcData
class RequestModelAction {
	String kind = 'requestModel'
	Map<String, String> options
}

@JsonRpcData
class SetModelAction {
	String kind = 'setModel'
	SModelRoot newRoot
}

@JsonRpcData
class SelectAction {
	String kind = 'elementSelected'
	List<String> selectedElementsIDs
	List<String> deselectedElementsIDs
}

@JsonRpcData
abstract class SModelElement {
	
	@NonNull String type
	
	@NonNull String id
	
	List<SModelElement> children
	
	SModelElement parent
	
}

@JsonRpcData
class SModelRoot extends SModelElement {
	
}

@JsonRpcData
class SNode extends SModelElement {
	
	int x
	
	int y
	
}

@JsonRpcData
class SEdge extends SModelElement {
	
	@NonNull String sourceId
	
	@NonNull String targetId
	
}
