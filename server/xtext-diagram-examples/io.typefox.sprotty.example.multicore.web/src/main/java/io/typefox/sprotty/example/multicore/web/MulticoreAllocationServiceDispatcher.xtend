package io.typefox.sprotty.example.multicore.web

import com.google.common.base.Optional
import com.google.inject.Inject
import io.typefox.sprotty.example.multicore.web.diagram.DiagramService
import io.typefox.sprotty.example.multicore.web.selection.SelectionService
import org.eclipse.xtext.web.server.IServiceContext
import org.eclipse.xtext.web.server.InvalidRequestException
import org.eclipse.xtext.web.server.XtextServiceDispatcher
import org.eclipse.xtext.web.server.model.PrecomputedServiceRegistry

class MulticoreAllocationServiceDispatcher extends XtextServiceDispatcher {
	
	@Inject DiagramService diagramService
	
	@Inject SelectionService selectionService
	
	@Inject
	override protected registerPreComputedServices(PrecomputedServiceRegistry registry) {
		super.registerPreComputedServices(registry)
		registry.addPrecomputedService(diagramService)
	}
	
	override protected createServiceDescriptor(String serviceType, IServiceContext context) {
		switch serviceType {
			case 'select':
				getSelectionService(context)
			default:
				super.createServiceDescriptor(serviceType, context)
		}
	}
	
	protected def getSelectionService(IServiceContext context) throws InvalidRequestException {
		val document = getDocumentAccess(context)
		val modelType = context.getString('modelType', Optional.absent)
		val elementId = context.getString('elementId', Optional.absent)
		val caretOffset = context.getInt('caretOffset', Optional.of(0))
		new ServiceDescriptor => [
			service = [
				try {
					selectionService.getOffset(document, modelType, elementId, caretOffset)
				} catch (Throwable throwable) {
					handleError(throwable)
				}
			]
		]
	}
	
}
