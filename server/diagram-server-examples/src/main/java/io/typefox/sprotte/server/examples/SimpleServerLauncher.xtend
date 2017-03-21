package io.typefox.sprotte.server.examples

import com.google.inject.Guice
import io.typefox.sprotte.api.DiagramServer
import io.typefox.sprotte.server.services.DiagramServerEndpoint
import io.typefox.sprotte.server.services.GuiceEndpointConfigurator
import java.net.InetSocketAddress
import javax.websocket.CloseReason
import javax.websocket.EndpointConfig
import javax.websocket.Session
import javax.websocket.server.ServerEndpointConfig
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.ServletContextHandler
import org.eclipse.jetty.util.log.Slf4jLog
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer
import org.eclipse.lsp4j.jsonrpc.messages.Message

class SimpleServerLauncher {
	
	static val LOG = new Slf4jLog(SimpleServerLauncher.name)
	
	static class TestServerEndpoint extends DiagramServerEndpoint {
    	override onOpen(Session session, EndpointConfig config) {
    		LOG.info('''Opened connection [«session.id»]''')
    		session.maxIdleTimeout = 0
    		super.onOpen(session, config)
    	}
    	
		override protected logServerMessage(Message message) {
			LOG.info('''SERVER: «message»''')
		}
		
		override protected logClientMessage(Message message) {
			LOG.info('''CLIENT: «message»''')
		}
		
	    override onError(Session session, Throwable t) {
			LOG.warn('''Unhandled error occurred [«session.id»]''', t)
			super.onError(session, t)
		}
		
		override onClose(Session session, CloseReason closeReason) {
			LOG.info('''Closed connection [«session.id»]''')
			super.onClose(session, closeReason)
		}
	}
	
	def static void main(String[] args) {
		val injector = Guice.createInjector[
			bind(DiagramServer).to(SimpleDiagramServer)
		]
		
		val server = new Server(new InetSocketAddress('localhost', 62000))
		val context =  new ServletContextHandler => [
			contextPath = '/'
		]
		server.handler = context
		
		val container = WebSocketServerContainerInitializer.configureContext(context)
		val endpointConfigBuilder = ServerEndpointConfig.Builder.create(TestServerEndpoint, '/')
				.configurator(new GuiceEndpointConfigurator(injector))
		container.addEndpoint(endpointConfigBuilder.build())
		
		try {
			server.start
			LOG.info('Press enter to stop the server...')
			new Thread[
		    	val key = System.in.read
		    	server.stop
		    	if (key == -1)
		    		LOG.warn('The standard input stream is empty')
		    ].start
			server.join
		} catch (Exception exception) {
			LOG.warn('Shutting down due to exception', exception)
			System.exit(1)
		}
	}

}