/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext.websocket

import com.google.inject.Inject
import io.typefox.sprotty.server.json.ActionTypeAdapter
import java.util.LinkedHashMap
import javax.websocket.Endpoint
import javax.websocket.EndpointConfig
import javax.websocket.Session
import org.eclipse.lsp4j.jsonrpc.RemoteEndpoint
import org.eclipse.lsp4j.jsonrpc.json.JsonRpcMethod
import org.eclipse.lsp4j.jsonrpc.json.JsonRpcMethodProvider
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler
import org.eclipse.lsp4j.jsonrpc.json.StreamMessageProducer
import org.eclipse.lsp4j.jsonrpc.services.ServiceEndpoints
import org.eclipse.lsp4j.services.LanguageClient
import org.eclipse.lsp4j.services.LanguageClientAware
import org.eclipse.lsp4j.services.LanguageServer

/**
 * Web socket endpoint for language servers including the diagram extension.
 */
class LanguageServerEndpoint extends Endpoint {
	
	@Inject LanguageServer languageServer
	
	override onOpen(Session session, EndpointConfig config) {
		val supportedMethods = new LinkedHashMap<String, JsonRpcMethod>
		supportedMethods.putAll(ServiceEndpoints.getSupportedMethods(LanguageClient))
		if (languageServer instanceof JsonRpcMethodProvider)
			supportedMethods.putAll(languageServer.supportedMethods)
		
		val jsonHandler = new MessageJsonHandler(supportedMethods) {
			override getDefaultGsonBuilder() {
				ActionTypeAdapter.configureGson(super.defaultGsonBuilder)
			}
		}
		val outgoingMessageStream = new WebSocketMessageConsumer(session.asyncRemote, jsonHandler)
		val serverEndpoint = new RemoteEndpoint(outgoingMessageStream, ServiceEndpoints.toEndpoint(languageServer))
		jsonHandler.setMethodProvider(serverEndpoint)
		val incomingMessageStream = new StreamMessageProducer(null, jsonHandler)
		session.addMessageHandler(new LanguageMessageHandler(incomingMessageStream, serverEndpoint))
		
		val remoteProxy = ServiceEndpoints.toServiceObject(serverEndpoint, LanguageClient)
		if (languageServer instanceof LanguageClientAware)
			languageServer.connect(remoteProxy)
	}
	
}