/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */ 
package org.eclipse.sprotty.xtext.ide

import org.eclipse.sprotty.xtext.DefaultDiagramModule
import org.eclipse.sprotty.xtext.DiagramLanguageServerExtension
import org.eclipse.xtext.ide.server.occurrences.IDocumentHighlightService

class IdeDiagramModule extends DefaultDiagramModule {
	
	def Class<? extends DiagramLanguageServerExtension> bindDiagramLanguageServerExtension() {
		IdeLanguageServerExtension
	}
	
	override bindIDiagramServerProvider() {
		IdeLanguageServerExtension
	}

	def Class<? extends IDocumentHighlightService> bindIDocumentHighlightService() {
		IdeHighlightService
	}
	
	override bindIDiagramSelectionListener() {
		IdeDiagramSelectionListener
	}

	override bindIDiagramOpenListener() {
		IdeDiagramOpenListener
	}
}
