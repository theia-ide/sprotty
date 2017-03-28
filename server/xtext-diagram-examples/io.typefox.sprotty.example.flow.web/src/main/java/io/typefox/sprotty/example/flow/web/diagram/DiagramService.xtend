package io.typefox.sprotty.example.flow.web.diagram

import com.google.inject.Inject
import com.google.inject.Singleton
import io.typefox.sprotty.example.flow.dataFlow.Flow
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.web.server.model.AbstractCachedService
import org.eclipse.xtext.web.server.model.IXtextWebDocument

@Singleton
class DiagramService extends AbstractCachedService<Program> {
	
	@Inject ExecutionFlowDiagramServer diagramServer
	
	override compute(IXtextWebDocument it, CancelIndicator cancelIndicator) {
		val flow = resource.contents.head as Flow
		return diagramServer.generateDiagram(flow, cancelIndicator)
	}
	
}