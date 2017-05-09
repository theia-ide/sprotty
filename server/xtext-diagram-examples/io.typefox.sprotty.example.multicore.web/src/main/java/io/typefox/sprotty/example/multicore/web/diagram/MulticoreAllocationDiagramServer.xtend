package io.typefox.sprotty.example.multicore.web.diagram

import com.google.common.collect.HashMultimap
import com.google.common.collect.Multimap
import com.google.inject.Inject
import io.typefox.sprotty.api.AbstractDiagramServer
import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.api.ComputedBoundsAction
import io.typefox.sprotty.api.FitToScreenAction
import io.typefox.sprotty.api.RequestModelAction
import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.api.SelectAction
import io.typefox.sprotty.layout.ILayoutEngine
import io.typefox.sprotty.layout.LayoutUtil
import io.typefox.sprotty.layout.SprottyLayoutConfigurator
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
	
	override protected getModel(ActionMessage message) {
		switch action: message.action {
			RequestModelAction:
				modelProvider.getModel(resourceId, action.modelType)
			ComputedBoundsAction:
				modelProvider.getModel(resourceId, 'flow')
		}
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
	
	def notifyClients(SModelRoot newRoot, SModelRoot oldRoot) {
		if (remoteEndpoint !== null) {
			for (client : type2Clients.get(newRoot.type)) {
				sendModel(newRoot, oldRoot, client)
			}
		}
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