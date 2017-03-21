package io.typefox.sprotte.example.flow.web

import com.google.inject.Inject
import io.typefox.sprotte.example.flow.web.diagram.ExecutionFlowDiagramServer
import org.eclipse.xtext.web.server.XtextServiceDispatcher
import org.eclipse.xtext.web.server.model.PrecomputedServiceRegistry

class ExecutionFlowServiceDispatcher extends XtextServiceDispatcher {
	
	@Inject ExecutionFlowDiagramServer diagramServer
	
	@Inject
	override protected registerPreComputedServices(PrecomputedServiceRegistry registry) {
		super.registerPreComputedServices(registry)
		registry.addPrecomputedService(diagramServer)
	}
	
}