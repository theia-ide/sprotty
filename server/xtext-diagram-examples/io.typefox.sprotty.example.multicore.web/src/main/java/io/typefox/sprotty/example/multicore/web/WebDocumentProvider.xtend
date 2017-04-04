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