package io.typefox.sprotty.example.flow.web

import org.eclipse.xtext.web.server.XtextServiceDispatcher

/**
 * Use this class to register additional components to be used within the web application.
 */
class ExecutionFlowWebModule extends AbstractExecutionFlowWebModule {
	
	def Class<? extends XtextServiceDispatcher> bindXtextServiceDispatcher() {
		ExecutionFlowServiceDispatcher
	}
	
}
