/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web

import com.google.inject.Inject
import com.google.inject.Provider
import org.eclipse.xtext.web.server.IServiceContext
import org.eclipse.xtext.web.server.model.DocumentSynchronizer
import org.eclipse.xtext.web.server.model.IWebDocumentProvider
import org.eclipse.xtext.web.servlet.HttpServiceContext

class WebDocumentProvider implements IWebDocumentProvider {
	
	@Inject Provider<DocumentSynchronizer> synchronizerProvider
	
	override get(String resourceId, IServiceContext serviceContext) {
		val synchronizer =
			if (resourceId === null)
				synchronizerProvider.get
			else
				serviceContext.session.get(DocumentSynchronizer, [synchronizerProvider.get])
		new ServletAwareWebDocument(resourceId, synchronizer) => [
			servletContext = (serviceContext as HttpServiceContext).request.servletContext
		]
	}
	
}