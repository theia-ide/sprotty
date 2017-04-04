package io.typefox.sprotty.example.multicore.web.diagram

import com.google.inject.Inject
import com.google.inject.Singleton
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import io.typefox.sprotty.example.multicore.multicoreAllocation.Step
import java.util.Enumeration
import java.util.Iterator
import java.util.List
import javax.servlet.http.HttpSessionEvent
import javax.servlet.http.HttpSessionListener
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.service.OperationCanceledManager
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.web.server.model.AbstractCachedService
import org.eclipse.xtext.web.server.model.IXtextWebDocument
import org.eclipse.xtext.web.server.model.XtextWebDocument

import static extension org.eclipse.xtext.EcoreUtil2.*

@Singleton
class DiagramService extends AbstractCachedService<ModelProvider> implements HttpSessionListener {
	
	static val SESSION_DOCUMENT_PREFIX = (XtextWebDocument -> '').toString
	
	@Inject ModelProvider modelProvider
	
	@Inject SelectionProvider selectionProvider
	
	@Inject MulticoreAllocationDiagramGenerator diagramGenerator
	
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
		val program = doc.resource.contents.head as Program
		val selection = selectionProvider.getSelection(doc.resourceId)
		val processorView = diagramGenerator.generateProcessorView(program, selection, cancelIndicator)
		modelProvider.putModel(doc.resourceId, processorView)
		cancelIndicator.checkCanceled
		val flowView = diagramGenerator.generateFlowView(program, selection, cancelIndicator)
		modelProvider.putModel(doc.resourceId, flowView)
		cancelIndicator.checkCanceled
		val filteredServers = synchronized (diagramServers) {
			diagramServers.filter[resourceId == doc.resourceId].toList
		}
		for (diagramServer : filteredServers) {
			diagramServer.notifyClients(processorView)
			diagramServer.notifyClients(flowView)
		}
		return modelProvider
	}
	
	def void setSelection(IXtextWebDocument doc, EObject selectedElement, CancelIndicator cancelIndicator) {
		val previousElement = selectionProvider.getSelection(doc.resourceId)
		selectionProvider.setSelection(doc.resourceId, selectedElement)
		if (previousElement.getContainerOfType(Step) != selectedElement.getContainerOfType(Step)) {
			compute(doc, cancelIndicator)
		}
	}
	
	override sessionCreated(HttpSessionEvent se) {
	}
	
	override sessionDestroyed(HttpSessionEvent se) {
		for (attr : se.session.attributeNames.toIterable) {
			if (attr.startsWith(SESSION_DOCUMENT_PREFIX)) {
				modelProvider.clear(attr.substring(SESSION_DOCUMENT_PREFIX.length))
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
