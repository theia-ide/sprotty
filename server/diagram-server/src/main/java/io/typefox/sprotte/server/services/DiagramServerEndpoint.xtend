package io.typefox.sprotte.server.services

import com.google.inject.Inject
import com.google.inject.Provider
import com.google.inject.Singleton
import io.typefox.sprotte.api.DiagramClient
import io.typefox.sprotte.api.DiagramServer
import java.util.LinkedHashMap
import javax.websocket.OnError
import javax.websocket.OnOpen
import javax.websocket.Session
import javax.websocket.server.ServerEndpoint
import org.apache.log4j.Logger
import org.eclipse.lsp4j.jsonrpc.RemoteEndpoint
import org.eclipse.lsp4j.jsonrpc.json.JsonRpcMethod
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler
import org.eclipse.lsp4j.jsonrpc.services.ServiceEndpoints

@Singleton
@ServerEndpoint(value='/languageServer', configurator=GuiceEndpointConfigurator)
class DiagramServerEndpoint {
    
    final val LOG = Logger.getLogger(DiagramServerEndpoint)
    
    static val DIAGRAM_SERVER = "DIAGRAM_SERVER"

    @Inject
    Provider<DiagramServer> diagramServerProvider

    @OnOpen
    def void onOpen(Session session) {
        val diagramServer = diagramServerProvider.get
        session.userProperties.put(DIAGRAM_SERVER, diagramServer)
        
        val supportedMethods = new LinkedHashMap<String, JsonRpcMethod>()
        supportedMethods.putAll(ServiceEndpoints.getSupportedMethods(diagramServer.class))
        supportedMethods.putAll(ServiceEndpoints.getSupportedMethods(DiagramClient))
        
        val jsonHandler = new MessageJsonHandler(supportedMethods)
        val reader = new WebSocketMessageProducer(session, jsonHandler)
        val writer = new WebSocketMessageConsumer(session, jsonHandler)
        val endpoint = new RemoteEndpoint([
            if (LOG.isInfoEnabled()) {
                LOG.info("Server : " + it)
            }
            writer.consume(it)
        ], ServiceEndpoints.toEndpoint(diagramServer))
        jsonHandler.setMethodProvider(endpoint)
        
        reader.listen[
            if (LOG.isInfoEnabled()) {
                LOG.info("Client : " + it)
            }
            endpoint.consume(it)
        ]
    }

    @OnError
    def void onError(Session session, Throwable t) {
    	LOG.error('''Unhandled error occurred. [Session ID: «session.id»]''', t);
    }

}
