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
		document.readOnly[ doc, cancelIndicator |
			var containedEObject = doc.resource.resolveContainedElementAt(offset)
			diagramService.setSelection(doc, containedEObject, cancelIndicator)
			return null
		]
		return super.findOccurrences(document, offset)
	}
	
}