package io.typefox.sprotty.example.multicore.web.diagram

import com.google.inject.Singleton
import io.typefox.sprotty.example.multicore.multicoreAllocation.Barrier
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import io.typefox.sprotty.example.multicore.multicoreAllocation.Task
import org.eclipse.xtext.util.CancelIndicator

@Singleton
class MulticoreAllocationDiagramGenerator {
	
	def Processor generateProcessorView(Program program, CancelIndicator cancelIndicator) {
		val processor = new Processor => [
		    type = 'processor'
		    id = 'processor'
		    rows = 0
		    columns = 0
		    children = newArrayList
		]
		if (program !== null) {
			val dim = Math.ceil(Math.sqrt(program.numberOfCores)) as int
			for (var i = 0; i < dim; i++) {
			    for (var j = 0; j < dim; j++) {
			        processor.children += createCore(i, j)
			        processor.children += createChannel(i, j, CoreDirection.up)
			        processor.children += createChannel(i, j, CoreDirection.down)
			        processor.children += createChannel(i, j, CoreDirection.left)
			        processor.children += createChannel(i, j, CoreDirection.right)
			    }
			    processor.children += createChannel(dim, i, CoreDirection.up)
			    processor.children += createChannel(dim, i, CoreDirection.down)
			    processor.children += createChannel(i, dim, CoreDirection.left)
			    processor.children += createChannel(i, dim, CoreDirection.right)
			}
			
			processor.children += createCrossbar(CoreDirection.up)
			processor.children += createCrossbar(CoreDirection.down)
			processor.children += createCrossbar(CoreDirection.left)
			processor.children += createCrossbar(CoreDirection.right)
			processor.rows = dim
			processor.columns = dim
		}
		return processor
	}
	
	private def createCore(int rowParam, int columnParam) {
		val pos = rowParam + '_' + columnParam
		return new Core => [
            id = 'core_' + pos
            type = 'core'
            row = rowParam
            column = columnParam
        ]
	}
	
	private def createChannel(int rowParam, int columnParam, CoreDirection directionParam) {
	    val pos = rowParam + '_' + columnParam
	    return new Channel => [
	        id = 'channel_' + directionParam + '_' + pos
	        type = 'channel'
	        column = columnParam
	        row = rowParam
	        direction = directionParam
	    ]
	}
	
	private def createCrossbar(CoreDirection directionParam) {
		return new Crossbar => [
		    id = 'cb_' + directionParam
		    type = 'crossbar'
		    direction = directionParam
		]
	}
	
	def Flow generateFlowView(Program program, CancelIndicator cancelIndicator) {
		val flow = new Flow => [
			type = 'flow'
			id = 'flow'
			children = newArrayList
		]
		if (program !== null) {
			val nodes = newHashMap
			val index = newIntArrayOfSize(1)
			// Transform tasks
			for (declaration : program.declarations.filter(Task)) {
				val tnode = new TaskNode
				tnode.type = 'task'
				tnode.id = declaration.name + '_' + (index++)
				tnode.kernel = declaration.kernel?.name
				nodes.put(declaration, tnode)
				flow.children += tnode
			}
			// Transform barriers
			for (declaration : program.declarations.filter(Barrier)) {
				val bnode = new BarrierNode
				bnode.type = 'barrier'
				bnode.id = 'barrier' + (index++)
				nodes.put(declaration, bnode)
				flow.children += bnode
				for (triggered : declaration.triggered) {
					val tnode = new TaskNode
					tnode.type = 'task'
					tnode.id = triggered.name + '_' + (index++)
					tnode.kernel = triggered.kernel?.name
					nodes.put(triggered, tnode)
					flow.children += tnode
				}
			}
			// Transform flows
			for (declaration : program.declarations.filter(Barrier)) {
				declaration.joined.forEach[ joined, k |
					val edge = new FlowEdge
					edge.type = 'edge'
					edge.id = 'flow' + (index++)
					edge.sourceId = nodes.get(joined)?.id
					edge.targetId = nodes.get(declaration)?.id
					edge.targetIndex = k
					flow.children += edge
				]
				val edgeCount = declaration.joined.size + declaration.triggered.size
				declaration.triggered.forEach[ triggered, k |
					val edge = new FlowEdge
					edge.type = 'edge'
					edge.id = 'flow' + (index++)
					edge.sourceId = nodes.get(declaration)?.id
					edge.sourceIndex = edgeCount - k
					edge.targetId = nodes.get(triggered)?.id
					flow.children += edge
				]
			}
		}
		return flow
	}
	
	private def ++(int[] index) {
		index.set(0, index.get(0) + 1)
	}
	
}