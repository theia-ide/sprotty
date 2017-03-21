package io.typefox.sprotte.server.services;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.websocket.Session;

import org.eclipse.lsp4j.jsonrpc.MessageConsumer;
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler;
import org.eclipse.lsp4j.jsonrpc.json.StreamMessageConsumer;
import org.eclipse.lsp4j.jsonrpc.messages.Message;

public class WebSocketMessageConsumer implements MessageConsumer {

    private final Session session;
    private final MessageJsonHandler jsonHandler;
    
    public WebSocketMessageConsumer(Session session, MessageJsonHandler jsonHandler) {
    	this.session = session;
    	this.jsonHandler = jsonHandler;
    }

    @Override
	public void consume(Message message) {
        if (session.isOpen()) {
        	try {
	        	ByteArrayOutputStream output = new ByteArrayOutputStream();
	        	StreamMessageConsumer writer = new StreamMessageConsumer(output, jsonHandler);
	            writer.consume(message);
				output.close();
	
	            String content = output.toString();
	            synchronized (session) {
	                session.getBasicRemote().sendText(content);
	            }
        	} catch (IOException e) {
        		throw new RuntimeException(e);
        	}
        }
    }
    
}
