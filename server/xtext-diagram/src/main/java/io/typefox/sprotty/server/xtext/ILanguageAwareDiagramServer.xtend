package io.typefox.sprotty.server.xtext

import io.typefox.sprotty.api.IDiagramServer
import java.util.concurrent.CompletableFuture
import java.util.function.Function
import org.eclipse.xtext.ide.server.ILanguageServerAccess.Context

interface ILanguageAwareDiagramServer extends IDiagramServer {
	
	def DiagramLanguageServerExtension getLanguageServerExtension()
	
	def <T> CompletableFuture<T> doRead(String uri, Function<Context, T> readOperation)
	
	def String getSourceUri()
}