package io.typefox.sprotty.server.xtext.tracing

import java.util.concurrent.CompletableFuture
import java.util.function.BiFunction
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.ide.server.ILanguageServerAccess.Context
import io.typefox.sprotty.api.SModelRoot

interface ITraceProvider {
	
	def void trace(Traceable traceable, EObject source)
	
	def <T> CompletableFuture<T> withSource(Traceable traceable, BiFunction<EObject, Context, T> readOperation)
	
	def Traceable findTracable(SModelRoot root, EObject element) 
}