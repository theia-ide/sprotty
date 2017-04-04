package io.typefox.sprotty.example.multicore.web.diagram

import com.google.inject.Inject
import com.google.inject.Singleton
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import java.util.Enumeration
import java.util.Iterator
import java.util.List
import javax.servlet.http.HttpSessionEvent
import javax.servlet.http.HttpSessionListener
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.web.server.model.AbstractCachedService
import org.eclipse.xtext.web.server.model.IXtextWebDocument
import org.eclipse.xtext.web.server.model.XtextWebDocument

@Singleton
class DiagramService extends AbstractCachedService<ModelProvider> implements HttpSessionListener {
	
	static val SESSION_DOCUMENT_PREFIX = (XtextWebDocument -> '').toString
	
	@Inject ModelProvider modelProvider
	
	@Inject MulticoreAllocationDiagramGenerator diagramGenerator
	
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
		val processorView = diagramGenerator.generateProcessorView(program, cancelIndicator)
		modelProvider.putModel(doc.resourceId, processorView)
		val flowView = diagramGenerator.generateFlowView(program, cancelIndicator)
		modelProvider.putModel(doc.resourceId, flowView)
		val filteredServers = synchronized (diagramServers) {
			diagramServers.filter[resourceId == doc.resourceId].toList
		}
		for (diagramServer : filteredServers) {
			diagramServer.notifyClients(processorView)
			diagramServer.notifyClients(flowView)
		}
		return modelProvider
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
