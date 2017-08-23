/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext

import io.typefox.sprotty.api.DefaultDiagramServer
import io.typefox.sprotty.api.RequestModelAction
import org.eclipse.xtend.lib.annotations.Accessors

/**
 * Diagram server for Xtext languages. When a {@link RequestModelAction} is received,
 * a diagram is generated for the corresponding resource by calling
 * {@link DiagramLanguageServerExtension#updateDiagram(LanguageAwareDiagramServer)}.
 */
class LanguageAwareDiagramServer extends DefaultDiagramServer implements ILanguageAwareDiagramServer {
	
	public static val OPTION_SOURCE_URI = 'sourceUri'
	
	@Accessors
	DiagramLanguageServerExtension languageServerExtension
	
	override protected handle(RequestModelAction request) {
		if (model.type == 'NONE' && languageServerExtension !== null) {
			if (request.options !== null)
				options = request.options
			languageServerExtension.updateDiagram(this)
		} else {
			super.handle(request)
		}
	}
	
	override getSourceUri() {
		options.get(OPTION_SOURCE_URI)
	}
	
}