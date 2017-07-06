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
import io.typefox.sprotty.api.SModelRoot
import java.util.List
import java.util.Map
import org.apache.log4j.Logger
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.lsp4j.jsonrpc.Endpoint
import org.eclipse.lsp4j.jsonrpc.services.JsonNotification
import org.eclipse.lsp4j.jsonrpc.services.ServiceEndpoints
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtext.diagnostics.Severity
import org.eclipse.xtext.ide.server.ILanguageServerAccess
import org.eclipse.xtext.ide.server.ILanguageServerExtension
import org.eclipse.xtext.ide.server.UriExtensions
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.validation.CheckMode
import org.eclipse.xtext.validation.IResourceValidator

import static java.util.Collections.*

class DiagramLanguageServerExtension implements DiagramEndpoint, ILanguageServerExtension, IDiagramServer.Provider {
	
	static val LOG = Logger.getLogger(DiagramLanguageServerExtension)
	
	@Inject extension IResourceValidator

	@Inject extension UriExtensions
	
	@Inject Provider<IDiagramServer> diagramServerProvider
	
	@Inject(optional = true) IDiagramGenerator diagramGenerator
	
	@Accessors(PROTECTED_GETTER)
	val Map<String, IDiagramServer> diagramServers = newLinkedHashMap

	DiagramEndpoint _client

	protected extension ILanguageServerAccess languageServerAccess
	
	override initialize(ILanguageServerAccess access) {
		this.languageServerAccess = access
		access.addBuildListener[ deltas |
			for (delta : deltas) {
				updateDiagrams(delta.uri.toPath)
			}
		]
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
	
	protected def void initializeDiagramServer(IDiagramServer server) {
		server.remoteEndpoint = [ message |
			client?.accept(message)
		]
		if (server instanceof LanguageAwareDiagramServer)
			server.languageServerExtension = this
	}
	
	protected def IDiagramServer findDiagramServerByUri(String uri) {
		synchronized (diagramServers) {
			val matching = diagramServers.values.filter(LanguageAwareDiagramServer).findFirst[sourceUri == uri]
			if (matching !== null) {
				return matching
			} else {
				// Fall back to finding or creating a diagram server with clientId equal to sourceUri
				return getDiagramServer(uri) => [ server |
					if (server instanceof LanguageAwareDiagramServer)
						server.sourceUri = uri
				]
			}
		}
	}
	
	@JsonNotification
	override void accept(ActionMessage message) {
		val server = getDiagramServer(message.clientId)
		server.accept(message)
	}
	
	def void updateDiagrams(String uri) {
		uri.doRead [ context |
			context.resource?.generateDiagrams(context.cancelChecker) ?: emptyList
		].thenAccept[ newRoots |
			updateDiagrams(newRoots, uri)
		].exceptionally[ throwable |
			LOG.error('Error while processing build results', throwable)
			return null
		]
	}

	protected def List<SModelRoot> generateDiagrams(Resource resource, CancelIndicator cancelIndicator) {
		if (diagramGenerator !== null && resource.shouldGenerate(cancelIndicator))
			singletonList(diagramGenerator.generate(resource, cancelIndicator))
	}
	
	protected def boolean shouldGenerate(Resource resource, CancelIndicator cancelIndicator) {
		val issues = resource.validate(CheckMode.NORMAL_AND_FAST, cancelIndicator)
		return !issues.exists[severity == Severity.ERROR]
	}
	
	protected def void updateDiagrams(List<SModelRoot> newRoots, String uri) {
		if (!newRoots.empty) {
			findDiagramServerByUri(uri).updateModel(newRoots.head)
		}
	}

}