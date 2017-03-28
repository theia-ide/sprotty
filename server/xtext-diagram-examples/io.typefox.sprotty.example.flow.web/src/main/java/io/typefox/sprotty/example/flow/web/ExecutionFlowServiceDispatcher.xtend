package io.typefox.sprotty.example.flow.web

import com.google.inject.Inject
import io.typefox.sprotty.example.flow.web.diagram.DiagramService
import org.eclipse.xtext.web.server.XtextServiceDispatcher
import org.eclipse.xtext.web.server.model.PrecomputedServiceRegistry

class ExecutionFlowServiceDispatcher extends XtextServiceDispatcher {
	
	@Inject DiagramService diagramService
	
	@Inject
	override protected registerPreComputedServices(PrecomputedServiceRegistry registry) {
		super.registerPreComputedServices(registry)
		registry.addPrecomputedService(diagramService)
	}
	
}