package io.typefox.sprotty.example.multicore.web

import io.typefox.sprotty.api.DiagramServer
import io.typefox.sprotty.example.multicore.web.diagram.MulticoreAllocationDiagramServer

/**
 * Use this class to register additional components to be used within the web application.
 */
class MulticoreAllocationWebModule extends AbstractMulticoreAllocationWebModule {
	
	def Class<? extends DiagramServer> bindDiagramServer() {
		MulticoreAllocationDiagramServer
	}
	
}
