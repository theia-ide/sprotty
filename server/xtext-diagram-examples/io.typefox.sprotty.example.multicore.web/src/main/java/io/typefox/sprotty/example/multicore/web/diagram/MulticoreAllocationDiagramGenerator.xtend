package io.typefox.sprotty.example.multicore.web.diagram

import com.google.inject.Singleton
import io.typefox.sprotty.example.multicore.multicoreAllocation.Barrier
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import io.typefox.sprotty.example.multicore.multicoreAllocation.Step
import io.typefox.sprotty.example.multicore.multicoreAllocation.Task
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskFinished
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskRunning
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.util.CancelIndicator

import static extension org.eclipse.xtext.EcoreUtil2.*

@Singleton
class MulticoreAllocationDiagramGenerator {
	
	def Processor generateProcessorView(Program program, EObject selection, CancelIndicator cancelIndicator) {
		val processor = new Processor => [
		    type = 'processor'
		    id = 'processor'
		    rows = 0
		    columns = 0
		    children = newArrayList
		]
		if (program !== null) {
			val dim = Math.ceil(Math.sqrt(program.numberOfCores)) as int
			val step = selection.getContainerOfType(Step)
			for (var i = 0; i < dim; i++) {
			    for (var j = 0; j < dim; j++) {
			        processor.children += createCore(dim, i, j, step)
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
	
	private def createCore(int dim, int rowParam, int columnParam, Step step) {
		val pos = rowParam + '_' + columnParam
		val core = new Core
        core.id = 'core_' + pos
        core.type = 'core'
        core.row = rowParam
        core.column = columnParam
        if (step !== null) {
            core.children = newArrayList
			val coreIndex = rowParam * dim + columnParam + 1
        	for (running : step.allocations.filter(TaskRunning)) {
        		if (running.core == coreIndex && running.task !== null && !running.task.eIsProxy)
        			core.children += createAllocatedTask(running.task, pos)
        	}
        }
        return core
	}
	
	private def createAllocatedTask(Task task, String corePos) {
		val alloc = new AllocatedTask
		alloc.id = 'task_' + corePos + '_' + task.name
		alloc.type = 'task'
		alloc.name = task.name
		val kernel = task.kernel
		if (kernel !== null && !kernel.eIsProxy) {
			alloc.kernel = kernel.name
			alloc.stackSize = kernel.stackSize
		}
		return alloc
	}
	
	private def createChannel(int rowParam, int columnParam, CoreDirection directionParam) {
	    val pos = rowParam + '_' + columnParam
	    val channel = new Channel
        channel.id = 'channel_' + directionParam + '_' + pos
        channel.type = 'channel'
        channel.column = columnParam
        channel.row = rowParam
        channel.direction = directionParam
	    return channel
	}
	
	private def createCrossbar(CoreDirection directionParam) {
		val crossbar = new Crossbar
	    crossbar.id = 'cb_' + directionParam
	    crossbar.type = 'crossbar'
	    crossbar.direction = directionParam
		return crossbar
	}
	
	def Flow generateFlowView(Program program, EObject selection, CancelIndicator cancelIndicator) {
		val flow = new Flow => [
			type = 'flow'
			id = 'flow'
			children = newArrayList
		]
		if (program !== null) {
			val step = selection.getContainerOfType(Step)
			val nodes = newHashMap
			val index = newIntArrayOfSize(1)
			// Transform tasks
			for (declaration : program.declarations.filter(Task)) {
				val tnode = createTask(declaration, step, index)
				nodes.put(declaration, tnode)
				flow.children += tnode
			}
			// Transform barriers
			for (declaration : program.declarations.filter(Barrier)) {
				val bnode = createBarrier(declaration, index)
				nodes.put(declaration, bnode)
				flow.children += bnode
				for (triggered : declaration.triggered) {
					val tnode = createTask(triggered, step, index)
					nodes.put(triggered, tnode)
					flow.children += tnode
				}
			}
			// Transform flows
			for (declaration : program.declarations.filter(Barrier)) {
				declaration.joined.forEach[ joined, k |
					val edge = createFlow(nodes.get(joined)?.id, nodes.get(declaration)?.id, index)
					edge.targetIndex = k
					flow.children += edge
				]
				val edgeCount = declaration.joined.size + declaration.triggered.size
				declaration.triggered.forEach[ triggered, k |
					val edge = createFlow(nodes.get(declaration)?.id, nodes.get(triggered)?.id, index)
					edge.sourceIndex = edgeCount - k
					flow.children += edge
				]
			}
		}
		return flow
	}
	
	private def createTask(Task declaration, Step step, int[] index) {
		val tnode = new TaskNode
		tnode.type = 'task'
		tnode.id = declaration.name + '_' + (index++)
		tnode.name = declaration.name
		if (step !== null) {
			if (step.allocations.filter(TaskRunning).exists[task == declaration])
				tnode.status = 'running'
			else if (step.allocations.filter(TaskFinished).exists[task == declaration])
				tnode.status = 'finished'
		}
		return tnode
	}
	
	private def createBarrier(Barrier declaration, int[] index) {
		val bnode = new BarrierNode
		bnode.type = 'barrier'
		bnode.id = 'barrier' + (index++)
		return bnode
	}
	
	private def createFlow(String sourceId, String targetId, int[] index) {
		val edge = new FlowEdge
		edge.type = 'edge'
		edge.id = 'flow' + (index++)
		edge.sourceId = sourceId
		edge.targetId = targetId
		return edge
	}
	
	private def ++(int[] index) {
		index.set(0, index.get(0) + 1)
	}
	
}