package io.typefox.sprotty.server.xtext.tracing

import com.google.inject.Inject
import io.typefox.sprotty.api.SModelElement
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.server.xtext.ILanguageAwareDiagramServer
import java.util.Map
import java.util.concurrent.CompletableFuture
import java.util.function.BiFunction
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.ide.server.ILanguageServerAccess.Context
import org.eclipse.xtext.ide.server.UriExtensions

import static extension org.eclipse.emf.ecore.util.EcoreUtil.*

class UriTraceProvider implements ITraceProvider {
	
	@Inject UriExtensions uriExtensions
	
	override trace(Traceable traceable, EObject source) {
		traceable.trace = source.URI.toPath
	}

	override <T> withSource(Traceable traceable, ILanguageAwareDiagramServer callingServer, BiFunction<EObject, Context, T> readOperation) {
		if (traceable.trace !== null) {
			val uri = traceable.trace.toURI
			val path = uriExtensions.toUriString(uri.trimFragment)
			return callingServer.languageServerExtension.languageServerAccess.doRead(path) [ context |
				val element = context.resource.resourceSet.getEObject(uri, true)
				return readOperation.apply(element, context)
			]
		}
		return CompletableFuture.completedFuture(null)
	}
	
	override Traceable findTracable(SModelRoot root, EObject element) {
		val containerChain = newArrayList
		var currentContainer = element
		while(currentContainer !== null) {
			containerChain.add(currentContainer)
			currentContainer = currentContainer.eContainer
		} 
		val uri2container = containerChain.toMap[URI.toPath]
		val results = newHashMap
		doFindTraceable(root, uri2container) [
			results.put($0, $1)
		]
		if(results.empty)
			return null
		else
		 	return results.entrySet.minBy[containerChain.indexOf(key)].value
	}
	
	protected def void doFindTraceable(SModelElement element, Map<String, EObject> uri2container, (EObject, Traceable)=>void result) {
		if (element instanceof Traceable) {
			val candidate = uri2container.get(element.trace)
			if(candidate !== null)
			result.apply(candidate, element)
		}
		element.children?.forEach [
			doFindTraceable(uri2container, result)
		]
	}
	
	protected def toPath(URI uri) {
		uriExtensions.toUriString(uri.trimFragment) + '#' + uri.fragment
	}
	
	protected def toURI(String path) {
		val parts = path.split('#')
		if(parts.size !== 2)
			throw new IllegalArgumentException('Invalid trace URI ' + path)
		return uriExtensions.toUri(parts.head).appendFragment(parts.last)
	}
}