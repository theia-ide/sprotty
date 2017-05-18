/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web

import io.typefox.sprotty.example.multicore.web.selection.MulticoreOccurrencesService
import org.eclipse.xtext.web.server.XtextServiceDispatcher
import org.eclipse.xtext.web.server.model.IWebDocumentProvider
import org.eclipse.xtext.web.server.occurrences.OccurrencesService

/**
 * Use this class to register additional components to be used within the web application.
 */
class MulticoreAllocationWebModule extends AbstractMulticoreAllocationWebModule {
	
	def Class<? extends XtextServiceDispatcher> bindXtextServiceDispatcher() {
		MulticoreAllocationServiceDispatcher
	}
	
	def Class<? extends IWebDocumentProvider> bindIWebDocumentProvider() {
		WebDocumentProvider
	}
	
	def Class<? extends OccurrencesService> bindOccurrencesService() {
		MulticoreOccurrencesService
	}
	
}
