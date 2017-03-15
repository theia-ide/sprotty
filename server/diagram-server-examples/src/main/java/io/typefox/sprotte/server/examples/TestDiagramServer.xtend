package io.typefox.sprotte.server.examples

import io.typefox.sprotte.api.DiagramServer
import io.typefox.sprotte.api.GEdge
import io.typefox.sprotte.api.GModelRoot
import io.typefox.sprotte.api.GNode
import io.typefox.sprotte.api.RequestModelAction
import io.typefox.sprotte.api.SelectAction
import io.typefox.sprotte.api.SetModelAction
import java.util.concurrent.CompletableFuture
import org.apache.log4j.Logger

class TestDiagramServer implements DiagramServer {

	static val LOG = Logger.getLogger(TestDiagramServer)

	override requestModel(RequestModelAction params) {
		val model = new SetModelAction => [
			newRoot = new GModelRoot => [
				type = 'graph'
				id = 'graph'
				children = #[
					new GNode => [
						type = 'node:circle'
						id = 'node0'
						x = 100
						y = 100
					],
					new GNode => [
						type = 'node:circle'
						id = 'node1'
						x = 300
						y = 150
					],
					new GEdge => [
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

	override elementSelected(SelectAction params) {
		LOG.info('element selected: ' + params)
	}

}
