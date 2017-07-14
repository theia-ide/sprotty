/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext.testlanguage.diagram

import io.typefox.sprotty.server.xtext.DefaultDiagramModule
import io.typefox.sprotty.server.xtext.IDiagramGenerator

class TestLanguageDiagramModule extends DefaultDiagramModule {
	
	override bindILanguageServerExtension() {
		TestDiagramLanguageServerExtension
	}
	
	def Class<? extends IDiagramGenerator> bindIDiagramGenerator() {
		TestLanguageDiagramGenerator
	}
	
}