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
import io.typefox.sprotty.server.xtext.DiagramLanguageServerExtension
import java.util.function.Consumer
import org.eclipse.xtext.ide.server.occurrences.DefaultDocumentHighlightService
import org.eclipse.xtext.resource.EObjectAtOffsetHelper
import org.eclipse.xtext.resource.XtextResource

class IdeHighlightService extends DefaultDocumentHighlightService {
	
	@Inject extension DiagramLanguageServerExtension
	
	@Inject extension EObjectAtOffsetHelper 
	
	override getDocumentHighlights(XtextResource resource, int offset) {
		val result = super.getDocumentHighlights(resource, offset)
		val element = resolveElementAt(resource, offset)
		if (element !== null) {
			findDiagramServersByUri(resource.getURI.toString).forEach [ server |
				val traceables = <io.typefox.sprotty.server.xtext.tracing.Traceable>newArrayList()
				server.model.findTraceablesAtOffset(offset, [
					traceables += it
				])
				if(!traceables.empty) {
					val smallest = traceables.minBy[ traceRegion.length ]
					server.dispatch(new SelectAction [
						selectedElementsIDs = #[(smallest as SModelElement).id] 
						deselectAll = true
					])					
					server.dispatch(new FitToScreenAction [
						maxZoom = 1.0
						elementIds = #[(smallest as SModelElement).id] 
					])					
				}
			]
		}
		return result
	}
	
	protected def void findTraceablesAtOffset(SModelElement root, int offset, Consumer<io.typefox.sprotty.server.xtext.tracing.Traceable> consumer) {
		if (root instanceof io.typefox.sprotty.server.xtext.tracing.Traceable) {
			val traceRegion = root.traceRegion
			if(traceRegion !== null && traceRegion.offset <= offset && traceRegion.offset + traceRegion.length > offset)
				consumer.accept(root)
		}
		root.children?.forEach[
			findTraceablesAtOffset(offset, consumer)
		]
	}
}
