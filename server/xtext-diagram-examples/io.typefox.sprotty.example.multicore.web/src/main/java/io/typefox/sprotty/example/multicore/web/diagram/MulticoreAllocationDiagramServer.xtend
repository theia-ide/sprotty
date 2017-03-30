package io.typefox.sprotty.example.multicore.web.diagram

import com.google.common.collect.HashMultimap
import com.google.common.collect.Multimap
import com.google.inject.Inject
import com.google.inject.Singleton
import io.typefox.sprotty.api.AbstractDiagramServer
import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.api.RequestModelAction
import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.api.SelectAction
import io.typefox.sprotty.api.SetBoundsAction
import io.typefox.sprotty.api.SetModelAction
import io.typefox.sprotty.api.UpdateModelAction
import io.typefox.sprotty.example.multicore.multicoreAllocation.Barrier
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import io.typefox.sprotty.example.multicore.multicoreAllocation.Task
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
import org.eclipse.xtext.util.CancelIndicator

import static io.typefox.sprotty.layout.ElkLayoutEngine.*

@Singleton
class MulticoreAllocationDiagramServer extends AbstractDiagramServer {
	
	static val LOG = Logger.getLogger(MulticoreAllocationDiagramServer)
	
	ILayoutEngine layoutEngine
	
	@Inject ModelProvider modelProvider
	
	val Multimap<String, String> type2Clients = HashMultimap.create()
	
	protected def notifyClients(SModelRoot root) {
		if (remoteEndpoint !== null) {
			for (client : type2Clients.get(root.type)) {
				remoteEndpoint.accept(new ActionMessage [
					clientId = client
					action = new UpdateModelAction => [
						modelType = root.type
						modelId = root.id
					]
				])
			}
		}
	}
	
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
		modelProvider.processorView = processor
		notifyClients(processor)
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
				tnode.autosize = true
				nodes.put(declaration, tnode)
				flow.children += tnode
			}
			// Transform barriers
			for (declaration : program.declarations.filter(Barrier)) {
				val bnode = new BarrierNode
				bnode.type = 'barrier'
				bnode.id = 'barrier' + (index++)
				bnode.autosize = true
				nodes.put(declaration, bnode)
				flow.children += bnode
				for (triggered : declaration.triggered) {
					val tnode = new TaskNode
					tnode.type = 'task'
					tnode.id = triggered.name + '_' + (index++)
					tnode.kernel = triggered.kernel?.name
					tnode.autosize = true
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
		modelProvider.flowView = flow
		notifyClients(flow)
		return flow
	}
	
	private def ++(int[] index) {
		index.set(0, index.get(0) + 1)
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
			.setProperty(LayeredOptions.NODE_PLACEMENT_STRATEGY, NodePlacementStrategy.NETWORK_SIMPLEX)
		configurator.configureByType('barrier')
			.setProperty(CoreOptions.NODE_SIZE_CONSTRAINTS, SizeConstraint.free())
			.setProperty(CoreOptions.NODE_SIZE_MINIMUM, new KVector(50, 10))
			.setProperty(CoreOptions.PORT_CONSTRAINTS, PortConstraints.FIXED_ORDER)
			.setProperty(LayeredOptions.NODE_PLACEMENT_NETWORK_SIMPLEX_NODE_FLEXIBILITY, NodeFlexibility.NODE_SIZE)
		layoutEngine.layout(graph, configurator)
	}
	
	override handle(SetBoundsAction action, ActionMessage message) {
		initializeLayoutEngine()
		val graph = modelProvider.flowView
		if (graph !== null) {
			LayoutUtil.applyResizeAction(graph, action)
			layout(graph)
			remoteEndpoint?.accept(new ActionMessage [
				clientId = message.clientId
				action = new SetModelAction [
					newRoot = graph
					modelType = graph.type
					modelId = graph.id
				]
			])
		} else
			throw new IllegalStateException("requestModel must be called before layout")
	}
	
	override handle(RequestModelAction action, ActionMessage message) {
		remoteEndpoint?.accept(new ActionMessage [
			clientId = message.clientId
			action = new SetModelAction [
				switch action.modelType {
					case 'processor':
						newRoot = modelProvider.processorView ?: (new Processor => [
			    			type = 'processor'
							id = 'processor'
						])
					case 'flow':
						newRoot = modelProvider.flowView ?: (new Flow => [
							type = 'flow'
							id = 'flow'
						])
				}
				modelType = newRoot.type
				modelId = newRoot.id
			]
		])
		type2Clients.put(action.modelType, message.clientId)
	}
	
	override handle(SelectAction action, ActionMessage message) {
		LOG.info('element selected = ' + action)
	}
	
}