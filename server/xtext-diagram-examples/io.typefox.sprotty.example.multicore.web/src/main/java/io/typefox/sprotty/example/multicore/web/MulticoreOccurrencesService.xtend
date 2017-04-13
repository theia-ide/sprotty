package io.typefox.sprotty.example.multicore.web

import com.google.inject.Inject
import io.typefox.sprotty.example.multicore.web.diagram.DiagramService
import org.eclipse.xtext.resource.EObjectAtOffsetHelper
import org.eclipse.xtext.web.server.model.XtextWebDocumentAccess
import org.eclipse.xtext.web.server.occurrences.OccurrencesService

class MulticoreOccurrencesService extends OccurrencesService {
	
	@Inject extension EObjectAtOffsetHelper
	
	@Inject DiagramService diagramService
	
	override findOccurrences(XtextWebDocumentAccess document, int offset) {
		val p = document.readOnly[ doc, cancelIndicator |
			return doc.resourceId -> doc.resource.resolveContainedElementAt(offset)
		]
		val resourceId = p.key
		val containedEObject = p.value
		diagramService.setSelection(document, resourceId, containedEObject)
		return super.findOccurrences(document, offset)
	}
	
}