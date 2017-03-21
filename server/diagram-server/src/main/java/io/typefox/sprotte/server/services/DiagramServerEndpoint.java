package io.typefox.sprotte.server.services;

import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.websocket.Endpoint;
import javax.websocket.EndpointConfig;
import javax.websocket.Session;

import org.eclipse.lsp4j.jsonrpc.RemoteEndpoint;
import org.eclipse.lsp4j.jsonrpc.json.JsonRpcMethod;
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler;
import org.eclipse.lsp4j.jsonrpc.messages.Message;
import org.eclipse.lsp4j.jsonrpc.services.ServiceEndpoints;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;

import io.typefox.sprotte.api.DiagramClient;
import io.typefox.sprotte.api.DiagramServer;

@Singleton
public class DiagramServerEndpoint extends Endpoint {
    
    private static final String DIAGRAM_SERVER = "DIAGRAM_SERVER";

    @Inject
    private Provider<DiagramServer> diagramServerProvider;

    @Override
    public void onOpen(Session session, EndpointConfig config) {
    	DiagramServer diagramServer = diagramServerProvider.get();
        session.getUserProperties().put(DIAGRAM_SERVER, diagramServer);
        
        HashMap<String, JsonRpcMethod> supportedMethods = new LinkedHashMap<>();
        supportedMethods.putAll(ServiceEndpoints.getSupportedMethods(diagramServer.getClass()));
        supportedMethods.putAll(ServiceEndpoints.getSupportedMethods(DiagramClient.class));
        
        MessageJsonHandler jsonHandler = new MessageJsonHandler(supportedMethods);
        WebSocketMessageProducer reader = new WebSocketMessageProducer(session, jsonHandler);
        WebSocketMessageConsumer writer = new WebSocketMessageConsumer(session, jsonHandler);
        RemoteEndpoint endpoint = new RemoteEndpoint(m -> {
            logServerMessage(m);
            writer.consume(m);
        }, ServiceEndpoints.toEndpoint(diagramServer));
        jsonHandler.setMethodProvider(endpoint);
        
        reader.listen(m -> {
            logClientMessage(m);
            endpoint.consume(m);
        });
    }
    
    protected void logServerMessage(Message message) {
    	// override to log server messages
    }
    
    protected void logClientMessage(Message message) {
    	// override to log client messages
    }

}
