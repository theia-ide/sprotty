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