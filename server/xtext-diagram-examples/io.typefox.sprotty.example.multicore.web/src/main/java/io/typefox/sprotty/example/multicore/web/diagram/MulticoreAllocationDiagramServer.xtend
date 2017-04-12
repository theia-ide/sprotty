package io.typefox.sprotty.example.multicore.web.diagram

import com.google.common.collect.HashMultimap
import com.google.common.collect.Multimap
import com.google.inject.Inject
import io.typefox.sprotty.api.AbstractDiagramServer
import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.api.ComputedBoundsAction
import io.typefox.sprotty.api.RequestBoundsAction
import io.typefox.sprotty.api.RequestModelAction
import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.api.SelectAction
import io.typefox.sprotty.api.SetModelAction
import io.typefox.sprotty.api.UpdateModelAction
import io.typefox.sprotty.layout.ILayoutEngine
import io.typefox.sprotty.layout.LayoutUtil
import io.typefox.sprotty.layout.SprottyLayoutConfigurator
import io.typefox.sprotty.server.websocket.WebsocketActionMessage
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
	
	override handle(RequestModelAction action, ActionMessage message) {
		val resourceId = action.options?.get('resourceId')
		LOG.info('Model requested for resource ' + resourceId)
		this.resourceId = resourceId
		this.type2Clients.put(action.modelType, message.clientId)
		val model = modelProvider.getModel(resourceId, action.modelType)
		if (model !== null) {
			remoteEndpoint?.accept(new ActionMessage [
				clientId = message.clientId
				if (model.type == 'processor' || modelProvider.isLayoutDone(resourceId, action.modelType)) {
					action = new SetModelAction [
						modelType = model.type
						modelId = model.id
						newRoot = model
					]
				} else {
					action = new RequestBoundsAction [
						root = model
					]
				}
			])
		}
	}
	
	def notifyClients(SModelRoot model) {
		if (remoteEndpoint !== null) {
			for (client : type2Clients.get(model.type)) {
				remoteEndpoint.accept(new ActionMessage [
					clientId = client
					if (model.type == 'processor') {
						action = new SetModelAction [
							modelType = model.type
							modelId = model.id
							newRoot = model
						]
					} else {
						action = new RequestBoundsAction [
							root = model
						]
					}
				])
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
	
	protected def layout(SGraph graph) {
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
			.setProperty(CoreOptions.NODE_SIZE_MINIMUM, new KVector(50, 10))
			.setProperty(CoreOptions.PORT_CONSTRAINTS, PortConstraints.FIXED_ORDER)
			.setProperty(LayeredOptions.NODE_PLACEMENT_NETWORK_SIMPLEX_NODE_FLEXIBILITY, NodeFlexibility.NODE_SIZE)
		layoutEngine.layout(graph, configurator)
	}
	
	override handle(ComputedBoundsAction action, ActionMessage message) {
		if (message instanceof WebsocketActionMessage) {
			initializeLayoutEngine()
			val graph = modelProvider.getModel(resourceId, 'flow')
			if (graph instanceof SGraph) {
				LayoutUtil.applyBounds(graph, action)
				layout(graph)
				modelProvider.setLayoutDone(resourceId, 'flow')
				remoteEndpoint?.accept(new ActionMessage [
					clientId = message.clientId
					action = new UpdateModelAction [
						modelType = graph.type
						modelId = graph.id
						newRoot = graph
					]
				])
			} else {
				LOG.error("Model not available for resource " + resourceId)
			}
		}
	}
	
	override handle(SelectAction action, ActionMessage message) {
		LOG.info('element selected = ' + action)
	}
	
}