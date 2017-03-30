package io.typefox.sprotty.server.examples

import io.typefox.sprotty.api.AbstractDiagramServer
import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.api.RequestModelAction
import io.typefox.sprotty.api.SEdge
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.api.SNode
import io.typefox.sprotty.api.SelectAction
import io.typefox.sprotty.api.SetBoundsAction
import io.typefox.sprotty.api.SetModelAction
import org.eclipse.jetty.util.log.Slf4jLog

class SimpleDiagramServer extends AbstractDiagramServer {

	static val LOG = new Slf4jLog(SimpleServerLauncher.name)
	
	override handle(RequestModelAction action, ActionMessage message) {
		val model = new SModelRoot => [
			type = 'graph'
			id = 'graph'
			children = #[
				new SNode => [
					type = 'node:circle'
					id = 'node0'
					x = 100.0
					y = 100.0
				],
				new SNode => [
					type = 'node:circle'
					id = 'node1'
					x = 300.0
					y = 150.0
				],
				new SEdge => [
					type = 'edge:straight'
					id = 'edge0'
					sourceId = 'node0'
					targetId = 'node1'
				]
			]
		]
		remoteEndpoint?.accept(new ActionMessage [
			clientId = message.clientId
			action = new SetModelAction [
				newRoot = model
			]
		])
	}
	
	override handle(SetBoundsAction action, ActionMessage message) {
		throw new UnsupportedOperationException
	}
	
	override handle(SelectAction action, ActionMessage message) {
		LOG.info('element selected: ' + action)
	}
	
}
