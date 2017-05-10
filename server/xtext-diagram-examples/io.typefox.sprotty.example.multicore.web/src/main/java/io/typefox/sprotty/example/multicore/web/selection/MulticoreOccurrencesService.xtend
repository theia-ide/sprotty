package io.typefox.sprotty.example.multicore.web.selection

import com.google.inject.Inject
import io.typefox.sprotty.example.multicore.web.diagram.DiagramService
import org.eclipse.xtext.web.server.model.XtextWebDocumentAccess
import org.eclipse.xtext.web.server.occurrences.OccurrencesService

class MulticoreOccurrencesService extends OccurrencesService {
	
	@Inject DiagramService diagramService
	
	@Inject SelectionService selectionService
	
	override findOccurrences(XtextWebDocumentAccess access, int offset) {
		val p = access.readOnly[ doc, cancelIndicator |
			val element = selectionService.getCurrentSelection(doc, offset)
			return doc.resourceId -> element
		]
		val resourceId = p.key
		val containedEObject = p.value
		diagramService.setSelection(access, resourceId, containedEObject)
		return super.findOccurrences(access, offset)
	}
	
}
