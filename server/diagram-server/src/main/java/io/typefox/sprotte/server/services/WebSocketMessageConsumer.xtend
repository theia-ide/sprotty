package io.typefox.sprotte.server.services

import java.io.ByteArrayOutputStream
import javax.websocket.Session
import org.eclipse.lsp4j.jsonrpc.MessageConsumer
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler
import org.eclipse.lsp4j.jsonrpc.json.StreamMessageConsumer
import org.eclipse.lsp4j.jsonrpc.messages.Message
import org.eclipse.xtend.lib.annotations.FinalFieldsConstructor

@FinalFieldsConstructor
class WebSocketMessageConsumer implements MessageConsumer {

    val Session session
    val MessageJsonHandler jsonHandler

    override consume(Message message) {
        if (session.open) {
            val output = new ByteArrayOutputStream
            val writer = new StreamMessageConsumer(output, jsonHandler)
            writer.consume(message)
            output.close

            val content = output.toString
            synchronized (session) {        	
                session.basicRemote.sendText(content)
            }
        }
    }
    
}
