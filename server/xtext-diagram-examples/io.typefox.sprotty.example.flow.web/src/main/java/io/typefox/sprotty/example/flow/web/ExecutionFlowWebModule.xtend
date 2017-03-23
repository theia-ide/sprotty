package io.typefox.sprotty.example.flow.web

import io.typefox.sprotty.api.DiagramServer
import io.typefox.sprotty.example.flow.web.diagram.ExecutionFlowDiagramServer
import org.eclipse.xtext.web.server.XtextServiceDispatcher

/**
 * Use this class to register additional components to be used within the web application.
 */
class ExecutionFlowWebModule extends AbstractExecutionFlowWebModule {
	
	def Class<? extends DiagramServer> bindDiagramServer() {
		ExecutionFlowDiagramServer
	}
	
	def Class<? extends XtextServiceDispatcher> bindXtextServiceDispatcher() {
		ExecutionFlowServiceDispatcher
	}
	
}
