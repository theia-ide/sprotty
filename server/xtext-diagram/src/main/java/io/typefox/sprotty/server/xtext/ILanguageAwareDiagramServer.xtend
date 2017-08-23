package io.typefox.sprotty.server.xtext

import io.typefox.sprotty.api.IDiagramServer

interface ILanguageAwareDiagramServer extends IDiagramServer {
	
	def DiagramLanguageServerExtension getLanguageServerExtension()
	
	def String getSourceUri()
}