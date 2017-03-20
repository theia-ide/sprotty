package io.typefox.sprotte.example.flow.web

import io.typefox.sprotte.api.DiagramServer
import io.typefox.sprotte.example.flow.web.diagram.ExecutionFlowDiagramServer

/**
 * Use this class to register additional components to be used within the web application.
 */
class ExecutionFlowWebModule extends AbstractExecutionFlowWebModule {
	
	def Class<? extends DiagramServer> bindDiagramServer() {
		ExecutionFlowDiagramServer
	}
	
}
