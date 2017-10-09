package io.typefox.sprotty.server.xtext.websocket

import javax.websocket.Session

class WebSocketMessageSender {
	
	/**
	 * If the session provides a text buffer that is large enough, the message is sent
	 * asynchronously, otherwise it is sent synchronously in chunks.
	 */
	def void sendMessage(String message, Session session) {
		if(message.length <= session.maxTextMessageBufferSize) {
			session.asyncRemote.sendText(message)
		} else {
			var currentOffset = 0
			while (currentOffset < message.length) {
				val currentEnd = Math.min(currentOffset + session.maxTextMessageBufferSize, message.length)
				session.basicRemote.sendText(message.substring(currentOffset, currentEnd), currentEnd === message.length)
				currentOffset = currentEnd
			}
		}
	}
}