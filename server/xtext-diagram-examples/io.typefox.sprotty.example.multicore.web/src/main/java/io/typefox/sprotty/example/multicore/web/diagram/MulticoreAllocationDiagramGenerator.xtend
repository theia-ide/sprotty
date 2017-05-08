package io.typefox.sprotty.example.multicore.web.diagram

import com.google.inject.Singleton
import io.typefox.sprotty.api.SCompartment
import io.typefox.sprotty.api.SLabel
import io.typefox.sprotty.api.SModelElement
import io.typefox.sprotty.example.multicore.multicoreAllocation.Barrier
import io.typefox.sprotty.example.multicore.multicoreAllocation.Kernel
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import io.typefox.sprotty.example.multicore.multicoreAllocation.Step
import io.typefox.sprotty.example.multicore.multicoreAllocation.Task
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskAllocation
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskFinished
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskRunning
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.util.CancelIndicator

import static extension org.eclipse.xtext.EcoreUtil2.*

@Singleton
class MulticoreAllocationDiagramGenerator {
	
	def Processor generateProcessorView(Program program, EObject selection, CancelIndicator cancelIndicator) {
		if (program !== null) {
			val taskAllocation = selection.getContainerOfType(TaskAllocation)
			if (taskAllocation !== null) {
				return createKernelCentricView(program, taskAllocation)
			} else {
				return createFullView(program, selection)
			}
		}
		return createProcessor(0)
	}
	
	private def createKernelCentricView(Program program, TaskAllocation allocation) {
		val kernel = allocation.task.kernel
		val kernelIndex = program.declarations.filter(Kernel).toList.indexOf(kernel)
		val step = allocation.eContainer as Step
		val allocationsSameKernel = step.allocations.filter[ task.kernel == kernel ]
		val core2allocation = allocationsSameKernel.toMap[core]
		val dim = Math.ceil(Math.sqrt(core2allocation.size)) as int
		val processor = createProcessor(dim)
		var i = 0
		for (core: core2allocation.keySet.sort) {
			processor.children += createCore(core, i/dim, i%dim, kernelIndex, core2allocation.get(core), allocation.core == core)
			i++
		}
		return processor
	}
	
	private def Processor createFullView(Program program, EObject selection) {
		val dim = Math.ceil(Math.sqrt(program.numberOfCores)) as int
		val processor = createProcessor(dim) 
		val kernels = program.declarations.filter(Kernel).toList
		val coreIndex2task = newHashMap 
		val step = selection.getContainerOfType(Step)
		if (step !== null) {
			step.allocations.forEach [
				coreIndex2task.put(core, it)
			]
		}
		for (var i = 0; i < dim; i++) {
		    for (var j = 0; j < dim; j++) {
		    	val coreIndex = dim * i + j + 1
		    	val taskAllocation = coreIndex2task.get(coreIndex)
				val kernelIndex = if(taskAllocation !== null) 
						kernels.indexOf(taskAllocation.task.kernel)
					else
						-1
		        processor.children += createCore(coreIndex, i, j, kernelIndex, taskAllocation, false)
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
		return processor
	}
	
	private def Processor createProcessor(int dimension) {
		new Processor => [
		    type = 'processor'
		    id = 'processor'
		    rows = dimension
		    columns = dimension
		    children = newArrayList
		]
	}
	
	private def createCore(int coreIndex, int rowParam, int columnParam,  
			int kernelIndex, TaskAllocation taskAllocation, boolean selectedParam) {
		val core = new Core [
	        id = 'core_' + coreIndex
	        type = 'core'
	        row = rowParam
	        column = columnParam
	        kernelNr = kernelIndex
	        layout = 'vbox'
			resizeContainer = false
	        children = newArrayList
			children += new SLabel => [
				id = 'nr_' + coreIndex
				type = 'label:heading' 
				text = padLeft(coreIndex)
			]
			if (taskAllocation !== null)
				children += createInfoCompartment(taskAllocation, coreIndex, kernelIndex)
			if (selectedParam)
				selected = selectedParam
		]
        return core
	}
	
	private def String padLeft(int n) {
        if (n < 10)
            '000' + n
        else if (n < 100)
            '00' + n
        else if (n < 1000)
            '0' + n
        else
            '' + n
    }
	
	
	private def createInfoCompartment(TaskAllocation task, int coreIndex, int kernelIndex) {
		val result = <SModelElement>newArrayList
		// hack: find better way to determine if task has finished
		if (task.programCounter.equals('0xFFFF')) {
			result += new SLabel [
				id = 't_' + coreIndex
				type = 'label:info' 				
				text = 'task: ' + task.task.name 
			]
			result += new SLabel [
				id = 'f_' + coreIndex
				type = 'label:info' 				
				text =  'Task Finished' 
			]
		} else {
			val stackBeginAddr = Integer.parseInt(task.task.kernel.stackBeginAddr.substring(2), 16) as int
			val stackSize = task.task.kernel.stackSize as float
			val currentStackPointer = Integer.parseInt(task.stackPointer.substring(2), 16) as int
			val percentStackUsed = ((stackBeginAddr - currentStackPointer) / stackSize) * 100.0 as float
			val percentStackUsedFormatted = String.format("%.1f", percentStackUsed)
			result += new SLabel [
				id = 't_' + coreIndex
				type = 'label:info' 								
				text = 'task: ' + task.task.name
			]
			result += new SLabel [
				id = 'f_' + coreIndex
				type = 'label:info' 								
				text = 'file: ' + task.sourceFile
			]
			result += new SLabel [
				id = 'pc_' + coreIndex
				type = 'label:info' 								
				text = '$pc: ' + task.programCounter
			]
			result += new SLabel [
				id = 'sp_' + coreIndex
				type = 'label:info' 								
				text = '$sp: ' + task.stackPointer
			]
			result += new SLabel [
				id = 'st_' + coreIndex
				type = 'label:info' 								
				text = 'stack used: ' + (stackBeginAddr - currentStackPointer) //+ ' (' + percentStackUsedFormatted + '%)' 
			]
		}
		return new SCompartment [
			id = 'comp_' + coreIndex
			type = 'comp'
			layout = 'vbox'
			resizeContainer = true
			children = result
		]
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
			val allocation = selection.getContainerOfType(TaskAllocation)
			val nodes = newHashMap
			// Transform tasks
			for (declaration : program.declarations.filter(Task)) {
				val tnode = createTask(declaration, step, allocation)
				nodes.put(declaration, tnode)
				flow.children += tnode
			}
			// Transform barriers
			for (declaration : program.declarations.filter(Barrier)) {
				val bnode = createBarrier(declaration)
				nodes.put(declaration, bnode)
				flow.children += bnode
				for (triggered : declaration.triggered) {
					val tnode = createTask(triggered, step, allocation)
					nodes.put(triggered, tnode)
					flow.children += tnode
				}
			}
			// Transform flows
			for (declaration : program.declarations.filter(Barrier)) {
				declaration.joined.forEach[ joined, k |
					val edge = createFlow(nodes.get(joined)?.id, nodes.get(declaration)?.id)
					edge.targetIndex = k
					flow.children += edge
				]
				val edgeCount = declaration.joined.size + declaration.triggered.size
				declaration.triggered.forEach[ triggered, k |
					val edge = createFlow(nodes.get(declaration)?.id, nodes.get(triggered)?.id)
					edge.sourceIndex = edgeCount - k
					flow.children += edge
				]
			}
		}
		return flow
	}
	
	private def createTask(Task declaration, Step step, TaskAllocation taskAllocation) {
		val tnode = new TaskNode
		tnode.type = 'task'
		tnode.id = 'task_' + declaration.name
		tnode.name = declaration.name
		if (step !== null) {
			if (step.allocations.filter(TaskRunning).exists[task == declaration])
				tnode.status = 'running'
			else if (step.allocations.filter(TaskFinished).exists[task == declaration])
				tnode.status = 'finished'
			if (taskAllocation !== null && taskAllocation.task == declaration)
				tnode.selected = true
		}
		return tnode
	}
	
	private def createBarrier(Barrier declaration) {
		val bnode = new BarrierNode
		bnode.type = 'barrier'
		bnode.id = 'barrier_' + declaration.joined.map[name].join('+') + '>>' + declaration.triggered.map[name].join('+')
		return bnode
	}
	
	private def createFlow(String sourceId, String targetId) {
		val edge = new FlowEdge
		edge.type = 'edge'
		edge.id = 'flow_' + sourceId + '--' + targetId
		edge.sourceId = sourceId
		edge.targetId = targetId
		return edge
	}
	
}