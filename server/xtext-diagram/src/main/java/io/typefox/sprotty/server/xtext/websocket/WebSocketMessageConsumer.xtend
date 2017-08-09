/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext.websocket

import java.io.ByteArrayOutputStream
import javax.websocket.RemoteEndpoint
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler
import org.eclipse.lsp4j.jsonrpc.json.StreamMessageConsumer
import org.eclipse.lsp4j.jsonrpc.messages.Message

/**
 * LSP4J message consumer that forwards messages to a web socket.
 */
class WebSocketMessageConsumer extends StreamMessageConsumer {
	
	val RemoteEndpoint.Async remote
	
	new(RemoteEndpoint.Async remote, MessageJsonHandler jsonHandler) {
		super(new ByteArrayOutputStream, jsonHandler)
		this.remote = remote
	}
	
	new(RemoteEndpoint.Async remote, String encoding, MessageJsonHandler jsonHandler) {
		super(new ByteArrayOutputStream, encoding, jsonHandler)
		this.remote = remote
	}
	
	override consume(Message message) {
		super.consume(message)
		val out = output as ByteArrayOutputStream
		remote.sendText(out.toString)
		out.reset()
	}
	
}