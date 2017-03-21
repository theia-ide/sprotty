package io.typefox.sprotte.example.multicore.web.diagram

import com.google.inject.Inject
import io.typefox.sprotte.api.DiagramServer
import io.typefox.sprotte.api.RequestModelAction
import io.typefox.sprotte.api.ResizeAction
import io.typefox.sprotte.api.SelectAction
import io.typefox.sprotte.api.SetModelAction
import org.apache.log4j.Logger
import org.eclipse.lsp4j.jsonrpc.CompletableFutures
import org.eclipse.xtext.ide.ExecutorServiceProvider

class MulticoreAllocationDiagramServer implements DiagramServer {
	
	static val LOG = Logger.getLogger(MulticoreAllocationDiagramServer)
	
	@Inject ExecutorServiceProvider executorServiceProvider
	
	override requestModel(RequestModelAction action) {
		return CompletableFutures.computeAsync(executorServiceProvider.get) [
			val dim = 8
			val cores = <Core>newArrayList
			val channels = <Channel>newArrayList
			for (var i = 0; i < dim; i++) {
			    for (var j = 0; j < dim; j++) {
			        cores += createCore(i, j)
			        channels += createChannel(i, j, Direction.up)
			        channels += createChannel(i, j, Direction.down)
			        channels += createChannel(i, j, Direction.left)
			        channels += createChannel(i, j, Direction.right)
			    }
			    channels += createChannel(dim, i, Direction.up)
			    channels += createChannel(dim, i, Direction.down)
			    channels += createChannel(i, dim, Direction.left)
			    channels += createChannel(i, dim, Direction.right)
			}
			
			val crossbars = <Crossbar>newArrayList
			crossbars += createCrossbar(Direction.up)
			crossbars += createCrossbar(Direction.down)
			crossbars += createCrossbar(Direction.left)
			crossbars += createCrossbar(Direction.right)
			
			return new SetModelAction => [
				newRoot = new Chip => [
				    id = 'chip'
				    type = 'chip'
				    rows = dim
				    columns = dim
				    children = (channels + crossbars + cores).toList
				]
			]
		]
	}
	
	override resize(ResizeAction action) {
		throw new UnsupportedOperationException
	}

	override elementSelected(SelectAction action) {
		LOG.info('element selected = ' + action)
	}
		
	private def createCore(int rowParam, int columnParam) {
		val pos = rowParam + '_' + columnParam
		return new Core => [
            id = 'core_' + pos
            type = 'core'
            row = rowParam
            column = columnParam
            load = Math.random()
        ]
	}
	
	private def createChannel(int rowParam, int columnParam, Direction directionParam) {
	    val pos = rowParam + '_' + columnParam
	    return new Channel => [
	        id = 'channel_' + directionParam + '_' + pos
	        type = 'channel'
	        column = columnParam
	        row = rowParam
	        direction = directionParam
	        load = Math.random()
	    ]
	}
	
	private def createCrossbar(Direction directionParam) {
		return new Crossbar => [
		    id = 'cb_' + directionParam
		    type = 'crossbar'
		    load = Math.random()
		    direction = directionParam
		]
	}
	
}