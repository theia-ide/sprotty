/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web

import com.google.inject.Inject
import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.example.multicore.web.diagram.DiagramService
import io.typefox.sprotty.layout.ElkLayoutEngine
import io.typefox.sprotty.server.websocket.DiagramServerEndpoint
import java.net.InetSocketAddress
import javax.websocket.CloseReason
import javax.websocket.EndpointConfig
import javax.websocket.Session
import javax.websocket.server.ServerEndpointConfig
import org.apache.log4j.Logger
import org.eclipse.elk.alg.layered.options.LayeredOptions
import org.eclipse.elk.core.util.persistence.ElkGraphResourceFactory
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.jetty.annotations.AnnotationConfiguration
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.server.handler.HandlerList
import org.eclipse.jetty.server.handler.ResourceHandler
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
class MulticoreServerLauncher {
	
	static val LOG = Logger.getLogger(MulticoreServerLauncher)
	
	static class TestServerEndpoint extends DiagramServerEndpoint {
    	override onOpen(Session session, EndpointConfig config) {
    		LOG.info('''Opened connection [«session.id»]''')
    		session.maxIdleTimeout = 0
    		super.onOpen(session, config)
    	}
    	
		override onClose(Session session, CloseReason closeReason) {
			LOG.info('''Closed connection [«session.id»]''')
			super.onClose(session, closeReason)
		}
    	
		override accept(ActionMessage message) {
			LOG.info('''SERVER: «message»''')
			super.accept(message)
		}
		
		override protected fireMessageReceived(ActionMessage message) {
			LOG.info('''CLIENT: «message»''')
			super.fireMessageReceived(message)
		}
	}
	
	static class TestEndpointConfigurator extends ServerEndpointConfig.Configurator {
		@Inject DiagramService diagramService
		
		override <T> getEndpointInstance(Class<T> endpointClass) throws InstantiationException {
			super.getEndpointInstance(endpointClass) => [ instance |
				val endpoint = instance as TestServerEndpoint
				endpoint.diagramServerProvider = diagramService
				endpoint.exceptionHandler = [e | LOG.warn(e)]
			]
		}
	}
	
	def static void main(String[] args) {
		Resource.Factory.Registry.INSTANCE.extensionToFactoryMap.put('elkg', new ElkGraphResourceFactory)
		ElkLayoutEngine.initialize(new LayeredOptions)
		val injector = new MulticoreAllocationWebSetup().createInjectorAndDoEMFRegistration()
		val launcher = injector.getInstance(MulticoreServerLauncher)
		launcher.launch()
	}
	
	@Inject DiagramService diagramService
	@Inject TestEndpointConfigurator endpointConfigurator
	@Inject DisposableRegistry disposableRegistry
	
	def void launch() {
		val server = new Server(new InetSocketAddress(8080))
		val webAppContext = new WebAppContext => [
			resourceBase = 'src/main/webapp'
			
			welcomeFiles = #['index.html']
			contextPath = '/'
			configurations = #[
				new AnnotationConfiguration,
				new WebXmlConfiguration,
				new WebInfConfiguration,
				new MetaInfConfiguration
			]
			setAttribute(WebInfConfiguration.CONTAINER_JAR_PATTERN,
				'.*/io\\.typefox\\.sprotty\\.example\\.multicore\\.web/.*,' +
				'.*/org\\.eclipse\\.xtext/.*\\.jar,' +
				'.*/org\\.webjars/.*\\.jar'
			)
			setInitParameter('org.eclipse.jetty.servlet.Default.dirAllowed', 'false')
			setInitParameter('org.eclipse.jetty.servlet.Default.useFileMappedBuffer', 'false')
			addEventListener(diagramService)
		]
		server.handler = new HandlerList => [
			addHandler(new ResourceHandler => [
				resourceBase = '../../../client'
				welcomeFiles = #['examples/index.html']
				dirAllowed = false
			])
			addHandler(webAppContext)
		]
		
		val container = WebSocketServerContainerInitializer.configureContext(webAppContext)
		val endpointConfigBuilder = ServerEndpointConfig.Builder.create(TestServerEndpoint, '/diagram')
		endpointConfigBuilder.configurator(endpointConfigurator)
		container.addEndpoint(endpointConfigBuilder.build())
		
		val log = new Slf4jLog(MulticoreServerLauncher.name)
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
