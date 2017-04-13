package io.typefox.sprotty.server.examples

import io.typefox.sprotty.api.AbstractDiagramServer
import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.api.ComputedBoundsAction
import io.typefox.sprotty.api.SEdge
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.api.SNode
import io.typefox.sprotty.api.SelectAction
import org.eclipse.jetty.util.log.Slf4jLog

class SimpleDiagramServer extends AbstractDiagramServer {

	static val LOG = new Slf4jLog(SimpleServerLauncher.name)
	
	override protected getModel(ActionMessage message) {
		new SModelRoot => [
			type = 'graph'
			id = 'graph'
			children = #[
				new SNode => [
					type = 'node:circle'
					id = 'node0'
					position => [
						x = 100.0
						y = 100.0
					]
				],
				new SNode => [
					type = 'node:circle'
					id = 'node1'
					position => [
						x = 300.0
						y = 150.0
					]
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
	
	override protected needsLayout(SModelRoot root) {
		false
	}
	
	override protected computeLayout(SModelRoot root, ComputedBoundsAction computedBounds) {
		throw new UnsupportedOperationException
	}
	
	override handle(SelectAction action, ActionMessage message) {
		LOG.info('element selected: ' + action)
	}
	
}
