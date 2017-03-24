package io.typefox.sprotty.server.examples

import io.typefox.sprotty.api.Action
import io.typefox.sprotty.api.RequestModelAction
import io.typefox.sprotty.api.SEdge
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.api.SNode
import io.typefox.sprotty.api.SelectAction
import io.typefox.sprotty.api.SetModelAction
import java.util.concurrent.CompletableFuture
import java.util.function.Consumer
import org.eclipse.jetty.util.log.Slf4jLog
import org.eclipse.xtend.lib.annotations.Accessors

class SimpleDiagramServer implements Consumer<Action> {

	static val LOG = new Slf4jLog(SimpleServerLauncher.name)
	
	@Accessors
	Consumer<Action> remoteEndpoint
	
	override accept(Action action) {
		
	}

	def requestModel(RequestModelAction action) {
		val model = new SetModelAction => [
			newRoot = new SModelRoot => [
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
		]
		CompletableFuture.completedFuture(model)
	}

	def elementSelected(SelectAction action) {
		LOG.info('element selected: ' + action)
	}
}
