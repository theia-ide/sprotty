package io.typefox.sprotty.example.multicore.web

import com.google.common.base.Optional
import com.google.inject.Inject
import io.typefox.sprotty.example.multicore.web.diagram.DiagramService
import io.typefox.sprotty.example.multicore.web.selection.SelectionService
import org.eclipse.xtext.web.server.IServiceContext
import org.eclipse.xtext.web.server.InvalidRequestException
import org.eclipse.xtext.web.server.InvalidRequestException.InvalidParametersException
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
		val modelType = context.getParameter('modelType')
		val stepType = context.getParameter('stepType')
		if (modelType === null && stepType === null || modelType !== null && stepType !== null)
			throw new InvalidParametersException("Exactly one of the parameters 'modelType' and 'stepType' must be specified.")
		val elementId = context.getString('elementId', Optional.of(''))
		val caretOffset = context.getInt('caretOffset', Optional.of(0))
		new ServiceDescriptor => [
			service = [
				try {
					if (modelType !== null)
						selectionService.getOffsetById(document, modelType, elementId, caretOffset)
					else if (stepType == 'next')
						selectionService.getNextStepOffset(document, caretOffset)
					else if (stepType == 'previous')
						selectionService.getPreviousStepOffset(document, caretOffset)
				} catch (Throwable throwable) {
					handleError(throwable)
				}
			]
		]
	}
	
}
