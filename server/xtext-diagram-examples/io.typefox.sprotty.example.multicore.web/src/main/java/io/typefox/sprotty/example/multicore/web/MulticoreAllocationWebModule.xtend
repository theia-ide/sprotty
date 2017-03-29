package io.typefox.sprotty.example.multicore.web

import org.eclipse.xtext.web.server.XtextServiceDispatcher

/**
 * Use this class to register additional components to be used within the web application.
 */
class MulticoreAllocationWebModule extends AbstractMulticoreAllocationWebModule {
	
	def Class<? extends XtextServiceDispatcher> bindXtextServiceDispatcher() {
		MulticoreAllocationServiceDispatcher
	}
	
}
