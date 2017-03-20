package io.typefox.sprotte.example.flow.web.diagram

import com.google.inject.Inject
import io.typefox.sprotte.api.DiagramServer
import io.typefox.sprotte.api.RequestModelAction
import io.typefox.sprotte.api.SelectAction
import io.typefox.sprotte.api.SetModelAction
import org.apache.log4j.Logger
import org.eclipse.lsp4j.jsonrpc.CompletableFutures
import org.eclipse.xtext.ide.ExecutorServiceProvider

class ExecutionFlowDiagramServer implements DiagramServer {
	
	static val LOG = Logger.getLogger(ExecutionFlowDiagramServer)
	
	@Inject ExecutorServiceProvider executorServiceProvider
	
	override requestModel(RequestModelAction params) {
		return CompletableFutures.computeAsync(executorServiceProvider.get) [
			return new SetModelAction => [
				newRoot = null
			]
		]
	}

	override elementSelected(SelectAction params) {
		LOG.info('element selected = ' + params)
	}
		
}
