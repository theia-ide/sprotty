package io.typefox.sprotte.example.multicore.web

import io.typefox.sprotte.api.DiagramServer
import io.typefox.sprotte.example.multicore.web.diagram.MulticoreAllocationDiagramServer

/**
 * Use this class to register additional components to be used within the web application.
 */
class MulticoreAllocationWebModule extends AbstractMulticoreAllocationWebModule {
	
	def Class<? extends DiagramServer> bindDiagramServer() {
		MulticoreAllocationDiagramServer
	}
	
}
