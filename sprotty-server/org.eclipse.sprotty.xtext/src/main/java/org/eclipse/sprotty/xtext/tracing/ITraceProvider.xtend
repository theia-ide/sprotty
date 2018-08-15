package org.eclipse.sprotty.xtext.tracing

import org.eclipse.sprotty.SModelRoot
import org.eclipse.sprotty.xtext.ILanguageAwareDiagramServer
import java.util.concurrent.CompletableFuture
import java.util.function.BiFunction
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.ide.server.ILanguageServerAccess.Context

interface ITraceProvider {
	
	def void trace(Traceable traceable, EObject source)
	
	def <T> CompletableFuture<T> withSource(Traceable traceable, ILanguageAwareDiagramServer languageServer, BiFunction<EObject, Context, T> readOperation)
	
	def Traceable findTracable(SModelRoot root, EObject element) 
}