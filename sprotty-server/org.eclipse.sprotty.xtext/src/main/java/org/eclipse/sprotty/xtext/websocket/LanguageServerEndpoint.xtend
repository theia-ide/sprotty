/********************************************************************************
 * Copyright (c) 2017-2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
package org.eclipse.sprotty.xtext.websocket

import com.google.inject.Inject
import org.eclipse.sprotty.server.json.ActionTypeAdapter
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