/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web.diagram

import com.google.common.collect.HashMultimap
import com.google.common.collect.Multimap
import com.google.inject.Inject
import io.typefox.sprotty.api.AbstractDiagramServer
import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.api.Bounds
import io.typefox.sprotty.api.ComputedBoundsAction
import io.typefox.sprotty.api.FitToScreenAction
import io.typefox.sprotty.api.HtmlRoot
import io.typefox.sprotty.api.ModelAction
import io.typefox.sprotty.api.PreRenderedElement
import io.typefox.sprotty.api.RequestModelAction
import io.typefox.sprotty.api.RequestPopupModelAction
import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.api.SModelElement
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.api.SelectAction
import io.typefox.sprotty.example.multicore.multicoreAllocation.Barrier
import io.typefox.sprotty.example.multicore.multicoreAllocation.Task
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskAllocation
import io.typefox.sprotty.layout.ILayoutEngine
import io.typefox.sprotty.layout.LayoutUtil
import io.typefox.sprotty.layout.SprottyLayoutConfigurator
import java.util.List
import org.apache.log4j.Logger
import org.eclipse.elk.alg.layered.options.LayeredOptions
import org.eclipse.elk.alg.layered.options.NodeFlexibility
import org.eclipse.elk.alg.layered.options.NodePlacementStrategy
import org.eclipse.elk.core.math.KVector
import org.eclipse.elk.core.options.CoreOptions
import org.eclipse.elk.core.options.Direction
import org.eclipse.elk.core.options.PortConstraints
import org.eclipse.elk.core.options.SizeConstraint
import org.eclipse.xtend.lib.annotations.Accessors

import static io.typefox.sprotty.layout.ElkLayoutEngine.*

class MulticoreAllocationDiagramServer extends AbstractDiagramServer {
	
	static val LOG = Logger.getLogger(MulticoreAllocationDiagramServer)
	
	@Inject ModelProvider modelProvider
	
	ILayoutEngine layoutEngine
	
	@Accessors(PUBLIC_GETTER)
	String resourceId
	
	val Multimap<String, String> type2Clients = HashMultimap.create()
	
	def notifyClients(SModelRoot newRoot, SModelRoot oldRoot) {
		if (remoteEndpoint !== null) {
			for (client : type2Clients.get(newRoot.type)) {
				sendModel(newRoot, oldRoot, client)
			}
		}
	}
	
	override protected getModel(ModelAction action, String clientId) {
		modelProvider.getModel(resourceId, action.modelType)
	}
	
	override protected needsServerLayout(SModelRoot root) {
		switch root.type {
			case 'flow': !modelProvider.isLayoutDone(resourceId, root.type)
			default: false
		}
	}

	override protected needsClientLayout(SModelRoot root) {
		switch root.type {
			case 'processor': true
			default: false
		}
	}

	override protected handle(RequestModelAction action, ActionMessage message) {
		val resourceId = action.options?.get('resourceId')
		LOG.info('Model requested for resource ' + resourceId)
		this.resourceId = resourceId
		this.type2Clients.put(action.modelType, message.clientId)
		super.handle(action, message)
	}
	
	override protected modelSent(SModelRoot newRoot, SModelRoot oldRoot, String clientId) {
		if (newRoot instanceof Flow) {
			val taskNodes = newRoot.children.filter(TaskNode)
			val selectedNodes = taskNodes.filter[selected !== null && selected].toList
			if (selectedNodes.empty) {
				val activeNodes = taskNodes.filter[status !== null].map[id]
				sendAction(new FitToScreenAction [
					elementIds = activeNodes.toList
					maxZoom = 1.0
					padding = 10.0
				], clientId)
			} else {
				sendAction(new SelectAction [
					selectedElementsIDs = selectedNodes.map[id]
					deselectAll = true
				], clientId)
				sendAction(new FitToScreenAction [
					elementIds = selectedNodes.map[id]
					maxZoom = 1.0
					padding = 10.0
				], clientId)
			}
		}
		if (newRoot instanceof Processor) {
			val selectedCores = newRoot.children.filter(Core).filter[selected !== null && selected].toList
			var sizeChanged = true
			var selectionChanged = true
			if (oldRoot instanceof Processor) {
				sizeChanged = newRoot.rows != oldRoot.rows || newRoot.columns != oldRoot.columns
				selectionChanged = selectedCores != oldRoot.children.filter(Core).filter[selected !== null && selected].toList
			}
			if (sizeChanged || selectionChanged) {
				sendAction(new SelectAction [
					selectedElementsIDs = selectedCores.map[id]
					deselectAll = true
				], clientId)
				sendAction(new FitToScreenAction [
					elementIds = selectedCores.map[id]
					maxZoom = 3.0
					padding = 10.0
				], clientId)
			}
		}
	}
	
	override protected getPopupModel(SModelElement element, SModelRoot model, RequestPopupModelAction request, String clientId) {
		val mapping = modelProvider.getMapping(resourceId, request.modelType)
		val source = mapping.inverse.get(element)
		var String title
		val body = newArrayList
		if (request.modelType == 'flow') {
			switch source {
				Task: {
					title = '''Task «source.name»'''
					if (source.kernel !== null) {
						body += '''Kernel: «source.kernel.name»'''
						if (source.kernel.duration > 0)
							body += '''Stack size: «source.kernel.stackSize»'''
						if (source.kernel.stackBeginAddr !== null)
							body += '''Stack start address: «source.kernel.stackBeginAddr»'''
					}
				}
				Barrier: {
					title = '''Barrier «source.name»'''
					if (!source.joined.empty)
						body += '''Joins «FOR t : source.joined SEPARATOR ', '»«t.name»«ENDFOR»'''
					if (!source.triggered.empty)
						body += '''Triggers «FOR t : source.triggered SEPARATOR ', '»«t.name»«ENDFOR»'''
				}
			}
		} else if (request.modelType == 'processor') {
			if (element instanceof Core) {
				val processor = model as Processor
				title = '''Core «processor.columns * element.row + element.column + 1»'''
				if (source instanceof TaskAllocation) {
					if (source.task !== null) {
						body += '''Task: «source.task.name»'''
						if (source.task.kernel !== null) {
							body += '''Kernel: «source.task.kernel.name»'''
							if (source.task.kernel.duration > 0)
								body += '''Stack size: «source.task.kernel.stackSize»'''
							if (source.task.kernel.stackBeginAddr !== null)
								body += '''Stack start address: «source.task.kernel.stackBeginAddr»'''
						}
					}
					if (source.programCounter !== null)
						body += '''Program counter: «source.programCounter»'''
					if (source.stackPointer !== null)
						body += '''Stack pointer: «source.stackPointer»'''
					if (source.sourceFile !== null)
						body += '''Source file: «source.sourceFile»'''
					if (source.stackTrace !== null)
						body += '''Stack trace: «source.stackTrace»'''
				}
			}
		}
		if (title !== null) {
			return createPopupModel(title, body, request.bounds)
		}
	}
	
	protected def createPopupModel(String title, List<String> body, Bounds bounds) {
		new HtmlRoot [
			type = 'html'
			id = 'popup'
			children = #[
				new PreRenderedElement[
					type = 'pre-rendered'
					id = 'popup-title'
					code = '''<div class="popup-title">«title»</div>'''
				],
				new PreRenderedElement[
					type = 'pre-rendered'
					id = 'popup-body'
					code = '''
						<div class="popup-body">
							«FOR text : body»
								<p>«text»</p>
							«ENDFOR»
						</div>
					'''
				]
			]
			canvasBounds = bounds
		]
	}
	
	protected def initializeLayoutEngine() {
		if (layoutEngine === null) {
			layoutEngine = new MulticoreAllocationLayoutEngine => [
				initialize(new LayeredOptions)
			]
		}
	}
	
	override protected computeLayout(SModelRoot root, ComputedBoundsAction computedBounds) {
		if (root instanceof SGraph) {
			LayoutUtil.applyBounds(root, computedBounds)
			initializeLayoutEngine()
			val configurator = new SprottyLayoutConfigurator
			configurator.configureByType('flow')
				.setProperty(CoreOptions.DIRECTION, Direction.DOWN)
				.setProperty(CoreOptions.SPACING_NODE_NODE, 40.0)
				.setProperty(CoreOptions.SPACING_EDGE_NODE, 25.0)
				.setProperty(LayeredOptions.SPACING_EDGE_NODE_BETWEEN_LAYERS, 20.0)
				.setProperty(LayeredOptions.SPACING_NODE_NODE_BETWEEN_LAYERS, 30.0)
				.setProperty(LayeredOptions.NODE_PLACEMENT_STRATEGY, NodePlacementStrategy.NETWORK_SIMPLEX)
			configurator.configureByType('barrier')
				.setProperty(CoreOptions.NODE_SIZE_CONSTRAINTS, SizeConstraint.free())
				.setProperty(CoreOptions.NODE_SIZE_MINIMUM, new KVector(50, 20))
				.setProperty(CoreOptions.PORT_CONSTRAINTS, PortConstraints.FIXED_ORDER)
				.setProperty(LayeredOptions.NODE_PLACEMENT_NETWORK_SIMPLEX_NODE_FLEXIBILITY, NodeFlexibility.NODE_SIZE)
			layoutEngine.layout(root, configurator)
			modelProvider.setLayoutDone(resourceId, root.type)
		}
	}
	
	override protected handle(SelectAction action, ActionMessage message) {
		LOG.info('element selected = ' + action)
	}
	
}