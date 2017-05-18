/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web.diagram

import com.google.inject.Inject
import com.google.inject.Singleton
import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import io.typefox.sprotty.example.multicore.multicoreAllocation.Step
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskAllocation
import io.typefox.sprotty.layout.LayoutUtil
import java.util.Enumeration
import java.util.Iterator
import java.util.List
import javax.servlet.http.HttpSessionEvent
import javax.servlet.http.HttpSessionListener
import org.apache.log4j.Logger
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.service.OperationCanceledManager
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.web.server.model.AbstractCachedService
import org.eclipse.xtext.web.server.model.IXtextWebDocument
import org.eclipse.xtext.web.server.model.XtextWebDocument
import org.eclipse.xtext.web.server.model.XtextWebDocumentAccess
import org.eclipse.xtext.web.server.validation.ValidationService

import static extension org.eclipse.xtext.EcoreUtil2.*

@Singleton
class DiagramService extends AbstractCachedService<ModelProvider> implements HttpSessionListener {
	
	static val LOG = Logger.getLogger(DiagramService)
	
	static val SESSION_DOCUMENT_PREFIX = (XtextWebDocument -> '').toString
	
	@Inject ModelProvider modelProvider
	
	@Inject SelectionProvider selectionProvider
	
	@Inject MulticoreAllocationDiagramGenerator diagramGenerator
	
	@Inject ValidationService validationService
	
	@Inject extension OperationCanceledManager
	
	val List<MulticoreAllocationDiagramServer> diagramServers = newArrayList
	
	def void addServer(MulticoreAllocationDiagramServer server) {
		synchronized (diagramServers) {
			diagramServers.add(server)
		}
	}
	
	def void removeServer(MulticoreAllocationDiagramServer server) {
		synchronized (diagramServers) {
			diagramServers.remove(server)
		}
	}
	
	override compute(IXtextWebDocument doc, CancelIndicator cancelIndicator) {
		if (doc instanceof XtextWebDocument) {
			val validationResult = doc.getCachedServiceResult(validationService, cancelIndicator, false)
			if (!validationResult.issues.exists[severity == 'error']) {
				doCompute(doc, cancelIndicator)
			}
		} else {
			LOG.warn('Direct document access is required for generating diagrams.')
		}
		return modelProvider
	}
	
	protected def void doCompute(IXtextWebDocument doc, CancelIndicator cancelIndicator) {
		val program = doc.resource.contents.head as Program
		val selection = selectionProvider.getSelection(doc.resourceId)
		val processorMapping = diagramGenerator.generateProcessorView(program, selection, cancelIndicator)
		val processorView = processorMapping.get(program) as Processor
		val oldProcessorView = modelProvider.getModel(doc.resourceId, processorView.type)
		modelProvider.putModel(doc.resourceId, processorView, processorMapping)
		modelProvider.setLayoutDone(doc.resourceId, processorView.type)
		cancelIndicator.checkCanceled
		val flowMapping = diagramGenerator.generateFlowView(program, selection, cancelIndicator)
		val flowView = flowMapping.get(program) as Flow
		val oldFlowView = modelProvider.getModel(doc.resourceId, flowView.type) 
		if (oldFlowView instanceof SGraph)
			LayoutUtil.copyLayoutData(oldFlowView, flowView)
		modelProvider.putModel(doc.resourceId, flowView, flowMapping)
		cancelIndicator.checkCanceled
		val filteredServers = synchronized (diagramServers) {
			diagramServers.filter[resourceId == doc.resourceId].toList
		}
		for (diagramServer : filteredServers) {
			diagramServer.notifyClients(processorView, oldProcessorView)
			diagramServer.notifyClients(flowView, oldFlowView)
		}
	}
	
	def void setSelection(XtextWebDocumentAccess document, String resourceId, EObject selectedElement) {
		val previousElement = selectionProvider.getSelection(resourceId)
		val previousStep = previousElement.getContainerOfType(Step)
		val previousTaskAllocation = previousElement.getContainerOfType(TaskAllocation)
		val selectedStep = selectedElement.getContainerOfType(Step)
		val selectedTaskAllocation = selectedElement.getContainerOfType(TaskAllocation)
		if (previousStep != selectedStep || previousTaskAllocation != selectedTaskAllocation) {
			val validationResult = validationService.getResult(document)
			if (!validationResult.issues.exists[severity == 'error']) {
				if (selectedTaskAllocation !== null && previousStep != selectedStep) {
					selectionProvider.setSelection(resourceId, previousElement.getContainerOfType(Step) ?: selectedStep)
					document.readOnly[ it, cancelIndicator |
						doCompute(CancelIndicator.NullImpl)
						return null
					]
				}
				selectionProvider.setSelection(resourceId, selectedElement)
				document.readOnly[ it, cancelIndicator |
					doCompute(CancelIndicator.NullImpl)
					return null
				]
			}
		}
	}
	
	override sessionCreated(HttpSessionEvent se) {
	}
	
	override sessionDestroyed(HttpSessionEvent se) {
		for (attr : se.session.attributeNames.toIterable) {
			if (attr.startsWith(SESSION_DOCUMENT_PREFIX)) {
				val resourceId = attr.substring(SESSION_DOCUMENT_PREFIX.length)
				LOG.info('Session destroyed: ' + resourceId)
				modelProvider.clear(resourceId)
			}
		}
	}
	
	def static <T> Iterable<T> toIterable(Enumeration<T> enumeration) {
		[
			new Iterator<T> {
				override hasNext() {
					enumeration.hasMoreElements
				}

				override next() {
					enumeration.nextElement
				}

				override remove() {
					throw new UnsupportedOperationException
				}
			}
		]
	}
	
}
