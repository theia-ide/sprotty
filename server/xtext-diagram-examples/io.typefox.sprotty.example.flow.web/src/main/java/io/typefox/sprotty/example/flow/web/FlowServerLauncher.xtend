package io.typefox.sprotty.example.flow.web

import io.typefox.sprotty.api.Action
import io.typefox.sprotty.example.flow.web.diagram.ExecutionFlowDiagramServer
import io.typefox.sprotty.server.websocket.DiagramServerEndpoint
import java.net.InetSocketAddress
import javax.websocket.EndpointConfig
import javax.websocket.Session
import javax.websocket.server.ServerEndpointConfig
import org.apache.log4j.Logger
import org.eclipse.jetty.annotations.AnnotationConfiguration
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.ServletContextHandler
import org.eclipse.jetty.util.log.Slf4jLog
import org.eclipse.jetty.webapp.MetaInfConfiguration
import org.eclipse.jetty.webapp.WebAppContext
import org.eclipse.jetty.webapp.WebInfConfiguration
import org.eclipse.jetty.webapp.WebXmlConfiguration
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer
import org.eclipse.xtext.util.DisposableRegistry

/**
 * This program starts an HTTP server for testing the web integration of your DSL.
 * Just execute it and point a web browser to http://localhost:8080/
 */
class FlowServerLauncher {
	
	static val LOG = Logger.getLogger(FlowServerLauncher)
	
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
		val injector = new ExecutionFlowWebSetup().createInjectorAndDoEMFRegistration()
		val disposableRegistry = injector.getInstance(DisposableRegistry)
		val diagramServer = injector.getInstance(ExecutionFlowDiagramServer)
		
		val server = new Server(new InetSocketAddress('localhost', 8080))
		server.handler = new WebAppContext => [
			resourceBase = 'src/main/webapp'
			welcomeFiles = #['index.html']
			contextPath = '/'
			configurations = #[
				new AnnotationConfiguration,
				new WebXmlConfiguration,
				new WebInfConfiguration,
				new MetaInfConfiguration
			]
			setAttribute(WebInfConfiguration.CONTAINER_JAR_PATTERN, '.*/io\\.typefox\\.sprotty\\.example\\.flow\\.web/.*,.*\\.jar')
			setInitParameter('org.mortbay.jetty.servlet.Default.useFileMappedBuffer', 'false')
		]
		
		val container = WebSocketServerContainerInitializer.configureContext(server.handler as ServletContextHandler)
		val endpointConfigBuilder = ServerEndpointConfig.Builder.create(TestServerEndpoint, '/diagram')
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
		
		val log = new Slf4jLog(FlowServerLauncher.name)
		try {
			server.start
			log.info('Server started ' + server.getURI + '...')
			new Thread[
				log.info('Press enter to stop the server...')
				val key = System.in.read
				if (key != -1) {
					server.stop
				} else {
					log.warn('Console input is not available. In order to stop the server, you need to cancel process manually.')
				}
			].start
			server.join
		} catch (Exception exception) {
			log.warn(exception.message)
			System.exit(1)
		} finally {
			disposableRegistry.dispose()
		}
	}
}
