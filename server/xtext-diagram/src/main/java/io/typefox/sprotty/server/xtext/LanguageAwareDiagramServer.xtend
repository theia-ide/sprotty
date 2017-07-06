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

class LanguageAwareDiagramServer extends DefaultDiagramServer {
	
	@Accessors
	DiagramLanguageServerExtension languageServerExtension
	
	@Accessors
	String sourceUri
	
	override protected handle(RequestModelAction request) {
		if (model.type == 'NONE' && languageServerExtension !== null) {
			sourceUri = request.options?.get('uri') ?: clientId
			languageServerExtension.updateDiagrams(sourceUri)
		} else {
			super.handle(request)
		}
	}
	
}