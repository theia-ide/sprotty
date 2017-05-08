package io.typefox.sprotty.example.multicore.web.selection

import com.google.inject.Inject
import io.typefox.sprotty.example.multicore.web.diagram.DiagramService
import org.eclipse.xtext.resource.EObjectAtOffsetHelper
import org.eclipse.xtext.web.server.model.XtextWebDocumentAccess
import org.eclipse.xtext.web.server.occurrences.OccurrencesService

import static extension org.eclipse.xtext.nodemodel.util.NodeModelUtils.*

class MulticoreOccurrencesService extends OccurrencesService {
	
	@Inject extension EObjectAtOffsetHelper
	
	@Inject DiagramService diagramService
	
	override findOccurrences(XtextWebDocumentAccess access, int offset) {
		val p = access.readOnly[ doc, cancelIndicator |
			var element = doc.resource.resolveContainedElementAt(offset)
			var node = element.node
			while (node !== null && !node.textRegion.contains(offset)) {
				element = element.eContainer
				node = element.node
			}
			return doc.resourceId -> element
		]
		val resourceId = p.key
		val containedEObject = p.value
		diagramService.setSelection(access, resourceId, containedEObject)
		return super.findOccurrences(access, offset)
	}
	
}
