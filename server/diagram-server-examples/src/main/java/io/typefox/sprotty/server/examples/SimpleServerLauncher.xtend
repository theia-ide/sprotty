/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.examples

import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.api.DefaultDiagramServer
import io.typefox.sprotty.api.Dimension
import io.typefox.sprotty.api.IDiagramServer
import io.typefox.sprotty.api.Point
import io.typefox.sprotty.api.SEdge
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.api.SNode
import io.typefox.sprotty.server.websocket.DiagramServerEndpoint
import java.net.InetSocketAddress
import javax.websocket.EndpointConfig
import javax.websocket.Session
import javax.websocket.server.ServerEndpointConfig
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.ServletContextHandler
import org.eclipse.jetty.util.log.Slf4jLog
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer

class SimpleServerLauncher {
	
	static val LOG = new Slf4jLog(SimpleServerLauncher.name)
	
	static class TestServerEndpoint extends DiagramServerEndpoint {
    	override onOpen(Session session, EndpointConfig config) {
    		LOG.info('''Opened connection [«session.id»]''')
    		session.maxIdleTimeout = 0
    		super.onOpen(session, config)
    	}
    	
		override accept(ActionMessage actionMessage) {
			LOG.info('''SERVER: «actionMessage.action»''')
			super.accept(actionMessage)
		}
		
		override protected fireMessageReceived(ActionMessage message) {
			LOG.info('''CLIENT: «message.action»''')
			super.fireMessageReceived(message)
		}
	}
	
	def static void main(String[] args) {
		new SimpleServerLauncher().launch()
	}
	
	def void launch() {
		val IDiagramServer.Provider diagramServerProvider = [ clientId |
			new DefaultDiagramServer(clientId) => [
				model = createModel()
			]
		]
		
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
					endpoint.diagramServerProvider = diagramServerProvider
					endpoint.exceptionHandler = [e | LOG.warn(e)]
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
	
	protected def createModel() {
		new SModelRoot => [
			type = 'graph'
			id = 'graph'
			children = #[
				new SNode => [
					type = 'node:circle'
					id = 'node0'
					position = new Point(100.0, 100.0)
					size = new Dimension(80.0, 80.0)
				],
				new SNode => [
					type = 'node:circle'
					id = 'node1'
					position = new Point(300.0, 150.0)
					size = new Dimension(80.0, 80.0)
				],
				new SEdge => [
					type = 'edge:straight'
					id = 'edge0'
					sourceId = 'node0'
					targetId = 'node1'
				]
			]
		]
	}

}