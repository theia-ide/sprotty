package io.typefox.sprotte.server.services;

import java.io.ByteArrayInputStream;

import javax.websocket.MessageHandler;
import javax.websocket.Session;

import org.eclipse.lsp4j.jsonrpc.MessageConsumer;
import org.eclipse.lsp4j.jsonrpc.MessageProducer;
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler;
import org.eclipse.lsp4j.jsonrpc.json.StreamMessageProducer;

public class WebSocketMessageProducer implements MessageProducer {

    private final Session session;
    private final MessageJsonHandler jsonHandler;
    
    public WebSocketMessageProducer(Session session, MessageJsonHandler jsonHandler) {
    	this.session = session;
    	this.jsonHandler = jsonHandler;
    }

    @Override
    public void listen(MessageConsumer messageConsumer) {
    	// This cannot be a lambda because the server wants to use reflection on it
    	MessageHandler messageHandler = new MessageHandler.Whole<String>() {
			public void onMessage(String message) {
    			process(message, messageConsumer);
			}
    	};
        session.addMessageHandler(messageHandler);
    }

    protected void process(String content, MessageConsumer messageConsumer) {
    	ByteArrayInputStream inputStream = new ByteArrayInputStream(content.getBytes());
    	@SuppressWarnings("resource")
		StreamMessageProducer reader = new StreamMessageProducer(inputStream, jsonHandler);
        reader.listen(messageConsumer);
    }
    
}
