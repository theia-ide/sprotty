package io.typefox.sprotty.example.multicore.web.diagram

import com.google.inject.Inject
import com.google.inject.Singleton
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.web.server.model.AbstractCachedService
import org.eclipse.xtext.web.server.model.IXtextWebDocument

@Singleton
class DiagramService extends AbstractCachedService<ModelProvider> {
	
	@Inject MulticoreAllocationDiagramServer diagramServer
	
	@Inject ModelProvider modelProvider
	
	override compute(IXtextWebDocument it, CancelIndicator cancelIndicator) {
		val program = resource.contents.head as Program
		diagramServer.generateProcessorView(program, cancelIndicator)
		diagramServer.generateFlowView(program, cancelIndicator)
		return modelProvider
	}
	
}
