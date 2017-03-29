package io.typefox.sprotty.example.multicore.web.diagram

import com.google.inject.Inject
import io.typefox.sprotty.api.AbstractDiagramServer
import io.typefox.sprotty.api.RequestModelAction
import io.typefox.sprotty.api.ResizeAction
import io.typefox.sprotty.api.SEdge
import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.api.SelectAction
import io.typefox.sprotty.api.SetModelAction
import io.typefox.sprotty.api.UpdateModelAction
import io.typefox.sprotty.example.multicore.multicoreAllocation.Barrier
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import io.typefox.sprotty.example.multicore.multicoreAllocation.Task
import io.typefox.sprotty.layout.ElkLayoutEngine
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
import org.eclipse.elk.core.options.SizeConstraint
import org.eclipse.xtext.util.CancelIndicator

import static io.typefox.sprotty.layout.ElkLayoutEngine.*

class MulticoreAllocationDiagramServer extends AbstractDiagramServer {
	
	static val LOG = Logger.getLogger(MulticoreAllocationDiagramServer)
	
	ILayoutEngine layoutEngine
	
	@Inject ModelProvider modelProvider
	
	def Processor generateProcessorView(Program program, CancelIndicator cancelIndicator) {
		val dim = 8
		val cores = <Core>newArrayList
		val channels = <Channel>newArrayList
		for (var i = 0; i < dim; i++) {
		    for (var j = 0; j < dim; j++) {
		        cores += createCore(i, j)
		        channels += createChannel(i, j, CoreDirection.up)
		        channels += createChannel(i, j, CoreDirection.down)
		        channels += createChannel(i, j, CoreDirection.left)
		        channels += createChannel(i, j, CoreDirection.right)
		    }
		    channels += createChannel(dim, i, CoreDirection.up)
		    channels += createChannel(dim, i, CoreDirection.down)
		    channels += createChannel(i, dim, CoreDirection.left)
		    channels += createChannel(i, dim, CoreDirection.right)
		}
		
		val crossbars = <Crossbar>newArrayList
		crossbars += createCrossbar(CoreDirection.up)
		crossbars += createCrossbar(CoreDirection.down)
		crossbars += createCrossbar(CoreDirection.left)
		crossbars += createCrossbar(CoreDirection.right)
		val processor = new Processor => [
		    id = 'processor'
		    type = 'processor'
		    rows = dim
		    columns = dim
		    children = (channels + crossbars + cores).toList
		]
		modelProvider.processorView = processor
		remoteEndpoint?.accept(new UpdateModelAction => [
			modelId = processor.id
		])
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
			var index = 0
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
				for (joined : declaration.joined) {
					val edge = new SEdge
					edge.type = 'edge'
					edge.id = 'flow' + (index++)
					edge.sourceId = nodes.get(joined)?.id
					edge.targetId = nodes.get(declaration)?.id
					flow.children += edge
				}
				for (triggered : declaration.triggered) {
					val edge = new SEdge
					edge.type = 'edge'
					edge.id = 'flow' + (index++)
					edge.sourceId = nodes.get(declaration)?.id
					edge.targetId = nodes.get(triggered)?.id
					flow.children += edge
				}
			}
		}
		modelProvider.flowView = flow
		remoteEndpoint?.accept(new UpdateModelAction => [
			modelId = flow.id
		])
		return flow
	}
	
	protected def initializeLayoutEngine() {
		if (layoutEngine === null) {
			layoutEngine = new ElkLayoutEngine => [
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
			.setProperty(LayeredOptions.NODE_PLACEMENT_NETWORK_SIMPLEX_NODE_FLEXIBILITY, NodeFlexibility.NODE_SIZE)
		layoutEngine.layout(graph, configurator)
	}
	
	override handle(ResizeAction action) {
		initializeLayoutEngine()
		val graph = modelProvider.flowView
		if (graph !== null) {
			LayoutUtil.applyResizeAction(graph, action)
			layout(graph)
			remoteEndpoint?.accept(new SetModelAction => [
				newRoot = graph
			])
		} else
			throw new IllegalStateException("requestModel must be called before layout")
	}
	
	override handle(RequestModelAction action) {
		remoteEndpoint?.accept(new SetModelAction => [
			switch action.options.get('type') {
				case 'processor':
					newRoot = modelProvider.processorView ?: new Processor
				case 'flow':
					newRoot = modelProvider.flowView ?: new Flow
			}
		])
	}
	
	override handle(SelectAction action) {
		LOG.info('element selected = ' + action)
	}
	
}