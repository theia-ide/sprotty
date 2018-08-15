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

import java.io.ByteArrayInputStream
import java.io.FilterInputStream
import java.io.IOException
import java.nio.charset.Charset
import java.util.List
import javax.websocket.MessageHandler
import org.eclipse.lsp4j.jsonrpc.RemoteEndpoint
import org.eclipse.lsp4j.jsonrpc.json.StreamMessageProducer
import org.eclipse.xtend.lib.annotations.FinalFieldsConstructor

/**
 * Web socket message handler that produces LSP4J messages.
 */
@FinalFieldsConstructor
class LanguageMessageHandler implements MessageHandler.Partial<String> {
	
	val StreamMessageProducer messageProducer
	val RemoteEndpoint serverEndpoint
	val List<byte[]> messages = newArrayList
	
	override onMessage(String partialMessage, boolean last) {
		if (partialMessage.length > 0) {
			messages.add(partialMessage.getBytes(Charset.forName('UTF-8')))
		}
		if (last && !messages.empty) {
			messageProducer.input = new PartialMessageInputStream(messages)
			messageProducer.listen(serverEndpoint)
			messages.clear()
		}
	}
	
	protected static class PartialMessageInputStream extends FilterInputStream {
		
		val List<byte[]> messages
		
		int currentMessageIndex = 0
	
		protected new(List<byte[]> messages) {
			super(new ByteArrayInputStream(messages.head))
			this.messages = messages
		}
		
		protected def boolean nextMessage() {
			currentMessageIndex++
			if (currentMessageIndex < messages.size) {
				in = new ByteArrayInputStream(messages.get(currentMessageIndex))
				return true
			} else {
				return false
			}
		}
		
		override available() throws IOException {
			val current = super.available()
			if (current <= 0 && nextMessage) {
				return super.available()
			} else {
				return current
			}
		}
		
		override read() throws IOException {
			val current = super.read()
			if (current < 0 && nextMessage) {
				return super.read()
			} else {
				return current
			}
		}
		
		override read(byte[] b) throws IOException {
			val current = super.read(b)
			if (current <= 0 && nextMessage) {
				return super.read(b)
			} else {
				return current
			}
		}
		
		override read(byte[] b, int off, int len) throws IOException {
			val current = super.read(b, off, len)
			if (current <= 0 && nextMessage) {
				return super.read(b, off, len)
			} else {
				return current
			}
		}
		
		override markSupported() {
			false
		}
		
	}
	
}