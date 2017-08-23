/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext

import com.google.inject.Inject
import com.google.inject.Provider
import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.api.IDiagramServer
import java.util.Collection
import java.util.List
import java.util.Map
import org.apache.log4j.Logger
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.lsp4j.jsonrpc.Endpoint
import org.eclipse.lsp4j.jsonrpc.services.ServiceEndpoints
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtext.diagnostics.Severity
import org.eclipse.xtext.ide.server.ILanguageServerAccess
import org.eclipse.xtext.ide.server.ILanguageServerExtension
import org.eclipse.xtext.ide.server.UriExtensions
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.validation.CheckMode
import org.eclipse.xtext.validation.IResourceValidator

/**
 * An extension of the <a href="https://github.com/Microsoft/language-server-protocol">Language Server Protocol (LSP)</a>
 * that adds diagram-related messages.
 */
class DiagramLanguageServerExtension implements DiagramServerEndpoint, ILanguageServerExtension, IDiagramServer.Provider {
	
	protected static val LOG = Logger.getLogger(DiagramLanguageServerExtension)
	
	@Inject extension IResourceValidator

	@Inject extension UriExtensions
	
	@Inject Provider<IDiagramServer> diagramServerProvider
	
	@Inject Provider<IDiagramGenerator> diagramGeneratorProvider
	
	@Accessors(PROTECTED_GETTER)
	val Map<String, IDiagramServer> diagramServers = newLinkedHashMap

	DiagramEndpoint _client

	protected extension ILanguageServerAccess languageServerAccess
	
	override initialize(ILanguageServerAccess access) {
		this.languageServerAccess = access
		access.addBuildListener[ deltas |
			updateDiagrams(deltas.map[uri].toSet)
		]
	}
	
	def ILanguageServerAccess getLanguageServerAccess() {
		languageServerAccess
	}

	protected def DiagramEndpoint getClient() {
		if (_client === null) {
			val client = languageServerAccess.languageClient
			if (client instanceof Endpoint) {
				_client = ServiceEndpoints.toServiceObject(client, DiagramEndpoint)
			}
		}
		return _client
	}
	
	/**
	 * Return the diagram server with the given client identifier, or create one if it does not
	 * exist yet.
	 */
	override getDiagramServer(String clientId) {
		synchronized (diagramServers) {
			var server = diagramServers.get(clientId)
			if (server === null) {
				server = diagramServerProvider.get
				server.clientId = clientId
				initializeDiagramServer(server)
				diagramServers.put(clientId, server)
			}
			return server
		}
	}
	
	/**
	 * Initialize a diagram server. Override this in order to use custom settings for diagram servers.
	 */
	protected def void initializeDiagramServer(IDiagramServer server) {
		server.remoteEndpoint = [ message |
			client?.accept(message)
		]
		if (server instanceof LanguageAwareDiagramServer)
			server.languageServerExtension = this
	}
	
	def List<? extends ILanguageAwareDiagramServer> findDiagramServersByUri(String uri) {
		synchronized (diagramServers) {
			diagramServers.values.filter(ILanguageAwareDiagramServer).filter[sourceUri == uri].toList
		}
	}
	
	/**
	 * Find a diagram server for the client referred in the given message and forward the message to
	 * that server.
	 */
	override void accept(ActionMessage message) {
		val server = getDiagramServer(message.clientId)
		server.accept(message)
	}
	
	/**
	 * Remove the diagram server associated with the given client identifier.
	 */
	override didClose(String clientId) {
		synchronized (diagramServers) {
			diagramServers.remove(clientId)
		}
	}
	
	/**
	 * Update the diagrams for the given URIs using the configured diagram generator.
	 */
	def void updateDiagrams(Collection<URI> uris) {
		for (uri : uris) {
			val path = uri.toPath
			val diagramServers = findDiagramServersByUri(path)
			if (!diagramServers.empty) {
				path.doRead [ context |
					if (context.resource.shouldGenerate(context.cancelChecker)) {
						val diagramGenerator = diagramGeneratorProvider.get
						return diagramServers.map[it -> diagramGenerator.generate(context.resource, diagramState, context.cancelChecker)]
					} else
						return emptyList
				].thenAccept[ resultList |
					resultList.filter[value !== null].forEach[key.updateModel(value)]
				].exceptionally[ throwable |
					LOG.error('Error while processing build results', throwable)
					return null
				]
			}
		}
	}
	
	/**
	 * Update the diagram for the given diagram server using the configured diagram generator.
	 */
	def void updateDiagram(LanguageAwareDiagramServer diagramServer) {
		val path = diagramServer.sourceUri
		if (path !== null) {
			path.doRead [ context |
				if (context.resource.shouldGenerate(context.cancelChecker)) {
					val diagramGenerator = diagramGeneratorProvider.get
					return diagramGenerator.generate(context.resource, diagramServer.diagramState, context.cancelChecker)
				}
			].thenAccept[ result |
				if (result !== null)
					diagramServer.updateModel(result)
			].exceptionally[ throwable |
				LOG.error('Error while processing build results', throwable)
				return null
			]
		}
	}

	protected def boolean shouldGenerate(Resource resource, CancelIndicator cancelIndicator) {
		if (resource === null)
			return false
		val issues = resource.validate(CheckMode.NORMAL_AND_FAST, cancelIndicator)
		return !issues.exists[severity == Severity.ERROR]
	}
	
}