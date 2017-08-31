/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web.diagram

import com.google.common.collect.BiMap
import com.google.common.collect.HashBiMap
import com.google.inject.Singleton
import io.typefox.sprotty.api.LayoutOptions
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
import java.util.ArrayList
import java.util.Set
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.util.CancelIndicator

import static io.typefox.sprotty.api.SModelUtil.*

import static extension org.eclipse.xtext.EcoreUtil2.*

@Singleton
class MulticoreAllocationDiagramGenerator {
	
	def BiMap<EObject, SModelElement> generateProcessorView(Program program, EObject selection, CancelIndicator cancelIndicator) {
		val mapping = HashBiMap.create()
		if (program !== null) {
			val taskAllocation = selection.getContainerOfType(TaskAllocation)
			if (taskAllocation !== null) {
				createKernelCentricView(program, taskAllocation, mapping)
			} else {
				createFullView(program, selection, mapping)
			}
		}
		if (mapping.empty)
			mapping.put(program, createProcessor(0))
		return mapping
	}
	
	private def createKernelCentricView(Program program, TaskAllocation allocation, BiMap<EObject, SModelElement> mapping) {
		val kernel = allocation.task.kernel
		val kernelIndex = program.declarations.filter(Kernel).toList.indexOf(kernel)
		val step = allocation.eContainer as Step
		val allocationsSameKernel = step.allocations.filter[ task.kernel == kernel ]
		val core2allocation = allocationsSameKernel.toMap[core]
		val dim = Math.ceil(Math.sqrt(core2allocation.size)) as int
		val processor = createProcessor(dim)
		mapping.put(program, processor)
		var i = 0
		for (entry : core2allocation.entrySet.sortBy[key]) {
			val index = entry.key
			val core = createCore(index, i/dim, i%dim, kernelIndex, core2allocation.get(index), allocation.core == index)
			mapping.put(entry.value, core)
			processor.children += core
			i++
		}
		return processor
	}
	
	private def Processor createFullView(Program program, EObject selection, BiMap<EObject, SModelElement> mapping) {
		val dim = Math.ceil(Math.sqrt(program.numberOfCores)) as int
		val processor = createProcessor(dim) 
		mapping.put(program, processor)
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
				val kernelIndex = if (taskAllocation !== null) 
						kernels.indexOf(taskAllocation.task.kernel)
					else
						-1
		        val core = createCore(coreIndex, i, j, kernelIndex, taskAllocation, false)
		        if (taskAllocation !== null)
		        	mapping.put(taskAllocation, core)
		        processor.children += core
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
		create(Processor, 'processor', 'processor') [
		    rows = dimension
		    columns = dimension
		    children = newArrayList
		    layoutOptions = new LayoutOptions [
		    	resizeContainer = false
		    	paddingLeft = 0.0
		    	paddingRight = 0.0
		    	paddingTop = 0.0
		    	paddingBottom = 0.0
		    	VGap = 0.0
		    ]
		]
	}
	
	private def createCore(int coreIndex, int rowParam, int columnParam,  
			int kernelIndex, TaskAllocation taskAllocation, boolean selectedParam) {
		create(Core, 'core_' + coreIndex, 'core') [
	        row = rowParam
	        column = columnParam
	        kernelNr = kernelIndex
	        layout = 'vbox'
	        children = newArrayList
			children += new SLabel => [
				layoutOptions = new LayoutOptions [
					HAlign = 'center'
				]
				id = 'nr_' + coreIndex
				type = 'label:heading' 
				text = padLeft(coreIndex)
			]
			if (taskAllocation !== null)
				children += createInfoCompartment(taskAllocation, coreIndex, kernelIndex)
			if (selectedParam)
				selected = selectedParam
		]
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
			result += create(SLabel, 't_' + coreIndex, 'label:info') [
				text = 'task: ' + task.task.name 
			]
			result += create(SLabel, 'f_' + coreIndex, 'label:info') [
				text =  'Task Finished' 
			]
		} else {
			val stackBeginAddr = Integer.parseInt(task.task.kernel.stackBeginAddr.substring(2), 16) as int
			val currentStackPointer = Integer.parseInt(task.stackPointer.substring(2), 16) as int
			result += create(SLabel, 't_' + coreIndex, 'label:info') [
				text = 'task: ' + task.task.name
			]
			result += create(SLabel, 'f_' + coreIndex, 'label:info') [
				text = 'file: ' + task.sourceFile
			]
			result += create(SLabel, 'pc_' + coreIndex, 'label:info') [
				text = '$pc: ' + task.programCounter
			]
			result += create(SLabel, 'sp_' + coreIndex, 'label:info') [
				text = '$sp: ' + task.stackPointer
			]
			result += create(SLabel, 'st_' + coreIndex, 'label:info') [
				text = 'stack used: ' + (stackBeginAddr - currentStackPointer) //+ ' (' + percentStackUsedFormatted + '%)' 
			]
		}
		return create(SCompartment, 'comp_' + coreIndex, 'comp') [
			layout = 'vbox'
			layoutOptions = new LayoutOptions [
				HAlign = 'left'
				resizeContainer = true
				paddingLeft = 5.0
				paddingRight = 5.0
				
			]
			children = result
		]
	}
	
	private def createChannel(int rowParam, int columnParam, CoreDirection directionParam) {
	    val pos = rowParam + '_' + columnParam
	    create(Channel, 'channel_' + directionParam + '_' + pos, 'channel') [
	        column = columnParam
	        row = rowParam
	        direction = directionParam
	    ]
	}
	
	private def createCrossbar(CoreDirection directionParam) {
		create(Crossbar, 'cb_' + directionParam, 'crossbar') [
	    	direction = directionParam
		]
	}
	
	def BiMap<EObject, SModelElement> generateFlowView(Program program, EObject selection, CancelIndicator cancelIndicator) {
		val kernels = program.declarations.filter(Kernel).toList
		
		val BiMap<EObject, SModelElement> mapping = HashBiMap.create()
		val flow = create(Flow, 'flow', 'flow') [
			children = new ArrayList
		]
		mapping.put(program, flow)
		if (program !== null) {
			val step = selection.getContainerOfType(Step)
			val allocation = selection.getContainerOfType(TaskAllocation)
			val assignedFlowIds = newHashSet
			// Transform tasks
			for (declaration : program.declarations.filter(Task)) {
				var kernelIndex = kernels.toList.indexOf(declaration.kernel)
				val tnode = createTask(declaration, step, allocation, kernelIndex)
				mapping.put(declaration, tnode)
				flow.children += tnode
			}
			// Transform barriers
			for (declaration : program.declarations.filter(Barrier)) {
				val bnode = createBarrier(declaration)
				mapping.put(declaration, bnode)
				flow.children += bnode
				for (triggered : declaration.triggered) {
					var kernelIndex = kernels.toList.indexOf(triggered.kernel)
					val tnode = createTask(triggered, step, allocation, kernelIndex)
					mapping.put(triggered, tnode)
					flow.children += tnode
				}
			}
			// Transform flows
			for (declaration : program.declarations.filter(Barrier)) {
				declaration.joined.forEach[ joined, k |
					val edge = createFlow(mapping.get(joined)?.id, mapping.get(declaration)?.id, assignedFlowIds)
					edge.targetIndex = k
					flow.children += edge
				]
				val edgeCount = declaration.joined.size + declaration.triggered.size
				declaration.triggered.forEach[ triggered, k |
					val edge = createFlow(mapping.get(declaration)?.id, mapping.get(triggered)?.id, assignedFlowIds)
					edge.sourceIndex = edgeCount - k
					flow.children += edge
				]
			}
		}
		return mapping
	}
	
	private def createTask(Task declaration, Step step, TaskAllocation taskAllocation, int kernelIndex) {
		val tnode = create(TaskNode, 'task_' + declaration.name, 'task')
		tnode.name = declaration.name
		tnode.kernelNr = kernelIndex
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
		create(BarrierNode, 'barrier_' + declaration.name, 'barrier') [
			name = declaration.name
		]
	}
	
	private def createFlow(String sourceId, String targetId, Set<String> assignedFlowIds) {
		val baseId = 'flow_' + sourceId + '--' + targetId
		val edge = create(FlowEdge, baseId, 'edge')
		var i = 2
		while (assignedFlowIds.contains(edge.id)) {
			edge.id = baseId + '_' + (i++)
		}
		assignedFlowIds.add(edge.id)
		edge.sourceId = sourceId
		edge.targetId = targetId
		return edge
	}
	
}