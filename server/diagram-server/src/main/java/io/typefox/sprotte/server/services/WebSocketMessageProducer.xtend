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
    var buffer = new StringBuilder

    override listen(MessageConsumer messageConsumer) {
        session.addMessageHandler(String, new MessageHandler.Partial<String>() {

            override onMessage(String partialMessage, boolean last) {
                buffer.append(partialMessage);
                if (last) {
                    process(buffer.toString, messageConsumer)
                    buffer = new StringBuilder
                }
            }

        })
    }

    protected def void process(String content, MessageConsumer messageConsumer) {
        val inputStream = new ByteArrayInputStream(content.bytes)
        val reader = new StreamMessageProducer(inputStream, jsonHandler)
        reader.listen(messageConsumer)
    }
    
}
