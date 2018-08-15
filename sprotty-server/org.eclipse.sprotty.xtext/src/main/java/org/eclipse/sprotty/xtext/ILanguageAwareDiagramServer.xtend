package org.eclipse.sprotty.xtext

import org.eclipse.sprotty.IDiagramServer

interface ILanguageAwareDiagramServer extends IDiagramServer {
	
	def DiagramLanguageServerExtension getLanguageServerExtension()
	
	def String getSourceUri()
}