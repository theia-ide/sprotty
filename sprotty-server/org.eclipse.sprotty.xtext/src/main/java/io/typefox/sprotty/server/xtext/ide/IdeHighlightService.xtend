/*
 * Copyright (C) 2017 TypeFox and others.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext.ide

import com.google.inject.Inject
import io.typefox.sprotty.api.FitToScreenAction
import io.typefox.sprotty.api.SModelElement
import io.typefox.sprotty.api.SelectAction
import io.typefox.sprotty.api.SelectAllAction
import io.typefox.sprotty.server.xtext.DiagramLanguageServerExtension
import io.typefox.sprotty.server.xtext.tracing.ITraceProvider
import io.typefox.sprotty.server.xtext.tracing.TraceRegionProvider
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
