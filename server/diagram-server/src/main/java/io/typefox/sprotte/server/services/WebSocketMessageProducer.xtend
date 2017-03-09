package io.typefox.sprotte.server.services

import java.io.ByteArrayInputStream
import javax.websocket.MessageHandler
import javax.websocket.Session
import org.eclipse.lsp4j.jsonrpc.MessageConsumer
import org.eclipse.lsp4j.jsonrpc.MessageProducer
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler
import org.eclipse.lsp4j.jsonrpc.json.StreamMessageProducer
import org.eclipse.xtend.lib.annotations.FinalFieldsConstructor

@FinalFieldsConstructor
class WebSocketMessageProducer implements MessageProducer {

    val Session session
    val MessageJsonHandler jsonHandler

    override listen(MessageConsumer messageConsumer) {
    	// This cannot be a lambda because the server wants to use reflection on it
    	val messageHandler = new MessageHandler.Whole<String> {
			override onMessage(String message) {
    			process(message, messageConsumer)
			}
    	}
        session.addMessageHandler(messageHandler)
    }

    protected def void process(String content, MessageConsumer messageConsumer) {
        val inputStream = new ByteArrayInputStream(content.bytes)
        val reader = new StreamMessageProducer(inputStream, jsonHandler)
        reader.listen(messageConsumer)
    }
    
}
