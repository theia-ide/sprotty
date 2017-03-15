package io.typefox.sprotte.example.multicore.web.diagram

import io.typefox.sprotte.api.DiagramServer
import io.typefox.sprotte.api.GEdge
import io.typefox.sprotte.api.GModelRoot
import io.typefox.sprotte.api.GNode
import io.typefox.sprotte.api.GetDiagramParams
import io.typefox.sprotte.api.SelectionParams
import java.util.concurrent.CompletableFuture
import org.apache.log4j.Logger

class MulticoreAllocationDiagramServer implements DiagramServer {
	
	static val LOG = Logger.getLogger(MulticoreAllocationDiagramServer)
	
	override getDiagram(GetDiagramParams params) {
		val model = new GModelRoot => [
			type = 'chip'
			id = 'chip'
			children = #[
				new GNode => [
					type = 'core'
					id = 'core0'
				],
				new GNode => [
					type = 'core'
					id = 'core1'
				],
				new GEdge => [
					type = 'channel'
					id = 'channel0'
				]
			]
		]
		CompletableFuture.completedFuture(model)
	}
	
	override elementSelected(SelectionParams params) {
		LOG.info('element selected: ' + params)
	}
	
}