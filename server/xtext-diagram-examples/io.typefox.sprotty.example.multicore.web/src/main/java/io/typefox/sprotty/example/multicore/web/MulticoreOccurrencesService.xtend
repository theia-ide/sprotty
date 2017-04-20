package io.typefox.sprotty.example.multicore.web

import com.google.inject.Inject
import io.typefox.sprotty.example.multicore.web.diagram.DiagramService
import org.eclipse.xtext.resource.EObjectAtOffsetHelper
import org.eclipse.xtext.web.server.model.XtextWebDocumentAccess
import org.eclipse.xtext.web.server.occurrences.OccurrencesService

import static extension org.eclipse.xtext.nodemodel.util.NodeModelUtils.*

class MulticoreOccurrencesService extends OccurrencesService {
	
	@Inject extension EObjectAtOffsetHelper
	
	@Inject DiagramService diagramService
	
	override findOccurrences(XtextWebDocumentAccess document, int offset) {
		val p = document.readOnly[ doc, cancelIndicator |
			val element = doc.resource.resolveContainedElementAt(offset)
			val node = element.node
			return doc.resourceId -> if (node === null || node.textRegion.contains(offset)) element
		]
		val resourceId = p.key
		val containedEObject = p.value
		diagramService.setSelection(document, resourceId, containedEObject)
		return super.findOccurrences(document, offset)
	}
	
}