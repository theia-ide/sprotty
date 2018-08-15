/*
 * Copyright (C) 2017 TypeFox and others.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package org.eclipse.sprotty.xtext.ide

import com.google.inject.Inject
import org.eclipse.sprotty.FitToScreenAction
import org.eclipse.sprotty.SModelElement
import org.eclipse.sprotty.SelectAction
import org.eclipse.sprotty.SelectAllAction
import org.eclipse.sprotty.xtext.DiagramLanguageServerExtension
import org.eclipse.sprotty.xtext.tracing.ITraceProvider
import org.eclipse.sprotty.xtext.tracing.TraceRegionProvider
import org.eclipse.xtext.ide.server.occurrences.DefaultDocumentHighlightService
import org.eclipse.xtext.resource.XtextResource

class IdeHighlightService extends DefaultDocumentHighlightService {

	@Inject extension DiagramLanguageServerExtension

	@Inject extension TraceRegionProvider

	@Inject extension ITraceProvider

	override getDocumentHighlights(XtextResource resource, int offset) {
		val result = super.getDocumentHighlights(resource, offset)
		findDiagramServersByUri(resource.getURI.toString).forEach [ server |
			val element = resource.getElementAtOffset(offset)
			val traceable = server.model.findTracable(element)
			if (traceable !== null) {
				server.dispatch(new SelectAllAction [
					select = false
				])
				server.dispatch(new SelectAction [
					selectedElementsIDs = #[(traceable as SModelElement).id]
				])
				server.dispatch(new FitToScreenAction [
					maxZoom = 1.0
					elementIds = #[(traceable as SModelElement).id]
				])
			}
		]
		return result
	}
}
