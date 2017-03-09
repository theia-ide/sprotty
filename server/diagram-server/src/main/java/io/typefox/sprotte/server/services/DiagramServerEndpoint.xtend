package io.typefox.sprotte.server.services

import com.google.inject.Inject
import com.google.inject.Provider
import com.google.inject.Singleton
import io.typefox.sprotte.api.DiagramClient
import io.typefox.sprotte.api.DiagramServer
import java.util.LinkedHashMap
import javax.websocket.Endpoint
import javax.websocket.EndpointConfig
import javax.websocket.Session
import org.eclipse.lsp4j.jsonrpc.RemoteEndpoint
import org.eclipse.lsp4j.jsonrpc.json.JsonRpcMethod
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler
import org.eclipse.lsp4j.jsonrpc.messages.Message
import org.eclipse.lsp4j.jsonrpc.services.ServiceEndpoints

@Singleton
class DiagramServerEndpoint extends Endpoint {
    
    static val DIAGRAM_SERVER = "DIAGRAM_SERVER"

    @Inject
    Provider<DiagramServer> diagramServerProvider

    override onOpen(Session session, EndpointConfig config) {
        val diagramServer = diagramServerProvider.get
        session.userProperties.put(DIAGRAM_SERVER, diagramServer)
        
        val supportedMethods = new LinkedHashMap<String, JsonRpcMethod>
        supportedMethods.putAll(ServiceEndpoints.getSupportedMethods(diagramServer.class))
        supportedMethods.putAll(ServiceEndpoints.getSupportedMethods(DiagramClient))
        
        val jsonHandler = new MessageJsonHandler(supportedMethods)
        val reader = new WebSocketMessageProducer(session, jsonHandler)
        val writer = new WebSocketMessageConsumer(session, jsonHandler)
        val endpoint = new RemoteEndpoint([ m |
            logServerMessage(m)
            writer.consume(m)
        ], ServiceEndpoints.toEndpoint(diagramServer))
        jsonHandler.setMethodProvider(endpoint)
        
        reader.listen[ m |
            logClientMessage(m)
            endpoint.consume(m)
        ]
    }
    
    protected def void logServerMessage(Message message) {
    	// override to log server messages
    }
    
    protected def void logClientMessage(Message message) {
    	// override to log client messages
    }

}
