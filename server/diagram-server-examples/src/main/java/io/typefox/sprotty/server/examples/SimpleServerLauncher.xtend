package io.typefox.sprotty.server.examples

import io.typefox.sprotty.server.websocket.DiagramServerEndpoint
import java.net.InetSocketAddress
import javax.websocket.EndpointConfig
import javax.websocket.Session
import javax.websocket.server.ServerEndpointConfig
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.ServletContextHandler
import org.eclipse.jetty.util.log.Slf4jLog
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer
import io.typefox.sprotty.api.Action

class SimpleServerLauncher {
	
	static val LOG = new Slf4jLog(SimpleServerLauncher.name)
	
	static class TestServerEndpoint extends DiagramServerEndpoint {
    	override onOpen(Session session, EndpointConfig config) {
    		LOG.info('''Opened connection [«session.id»]''')
    		session.maxIdleTimeout = 0
    		super.onOpen(session, config)
    	}
    	
		override accept(Action action) {
			LOG.info('''SERVER: «action»''')
			super.accept(action)
		}
		
		override protected fireActionReceived(Action action) {
			LOG.info('''CLIENT: «action»''')
			super.fireActionReceived(action)
		}
	}
	
	def static void main(String[] args) {
		val diagramServer = new SimpleDiagramServer
		
		val server = new Server(new InetSocketAddress('localhost', 62000))
		val context =  new ServletContextHandler => [
			contextPath = '/'
		]
		server.handler = context
		
		val container = WebSocketServerContainerInitializer.configureContext(context)
		val endpointConfigBuilder = ServerEndpointConfig.Builder.create(TestServerEndpoint, '/')
		endpointConfigBuilder.configurator(new ServerEndpointConfig.Configurator {
			override <T> getEndpointInstance(Class<T> endpointClass) throws InstantiationException {
				super.getEndpointInstance(endpointClass) => [ instance |
					val endpoint = instance as DiagramServerEndpoint
					diagramServer.remoteEndpoint = endpoint
					endpoint.addActionListener(diagramServer)
					endpoint.addErrorListener[e | LOG.warn(e)]
				]
			}
		})
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