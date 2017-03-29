package io.typefox.sprotty.example.multicore.web

import com.google.inject.Inject
import io.typefox.sprotty.example.multicore.web.diagram.DiagramService
import org.eclipse.xtext.web.server.XtextServiceDispatcher
import org.eclipse.xtext.web.server.model.PrecomputedServiceRegistry

class MulticoreAllocationServiceDispatcher extends XtextServiceDispatcher {
	
	@Inject DiagramService diagramService
	
	@Inject
	override protected registerPreComputedServices(PrecomputedServiceRegistry registry) {
		super.registerPreComputedServices(registry)
		registry.addPrecomputedService(diagramService)
	}
	
}
