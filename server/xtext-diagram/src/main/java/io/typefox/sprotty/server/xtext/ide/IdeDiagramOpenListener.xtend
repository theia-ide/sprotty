/*
 * Copyright (C) 2017 TypeFox and others.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext.ide

import com.google.inject.Inject
import io.typefox.sprotty.api.IDiagramOpenListener
import io.typefox.sprotty.api.IDiagramServer
import io.typefox.sprotty.api.OpenAction
import io.typefox.sprotty.api.SModelIndex
import io.typefox.sprotty.server.xtext.ILanguageAwareDiagramServer
import io.typefox.sprotty.server.xtext.tracing.ITraceProvider
import io.typefox.sprotty.server.xtext.tracing.TraceRegionProvider
import io.typefox.sprotty.server.xtext.tracing.Traceable
import org.eclipse.lsp4j.Location
import org.eclipse.lsp4j.Range
import org.eclipse.xtext.ide.server.UriExtensions

class IdeDiagramOpenListener implements IDiagramOpenListener {

	@Inject extension UriExtensions

	@Inject extension ITraceProvider

	@Inject extension TraceRegionProvider

	override elementOpened(OpenAction action, IDiagramServer server) {
		if (server instanceof ILanguageAwareDiagramServer) {
			val languageServerExtension = server.languageServerExtension
			if (languageServerExtension instanceof IdeLanguageServerExtension) {
				val selectedElement = new SModelIndex(server.model).get(action.elementId)
				if (selectedElement instanceof Traceable) {
					selectedElement.withSource(server) [ element, context |
						if (element !== null) {
							val traceRegion = element.significantRegion
							val start = context.document.getPosition(traceRegion.offset)
							val end = context.document.getPosition(traceRegion.offset + traceRegion.length)
							val uri = context.resource.URI.toUriString
							languageServerExtension.client.openInTextEditor(
								new OpenInTextEditorMessage(new Location(uri, new Range(start, end)), true)
							)
							return null
						}
					]
				}
			}
		}
	}
}
