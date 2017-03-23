package io.typefox.sprotty.example.flow.web.diagram

import com.google.inject.Inject
import com.google.inject.Singleton
import io.typefox.sprotty.api.DiagramClient
import io.typefox.sprotty.api.DiagramClientAware
import io.typefox.sprotty.api.DiagramServer
import io.typefox.sprotty.api.RequestModelAction
import io.typefox.sprotty.api.ResizeAction
import io.typefox.sprotty.api.SEdge
import io.typefox.sprotty.api.SelectAction
import io.typefox.sprotty.api.SetModelAction
import io.typefox.sprotty.api.UpdateModelAction
import io.typefox.sprotty.example.flow.dataFlow.Barrier
import io.typefox.sprotty.example.flow.dataFlow.Execution
import io.typefox.sprotty.example.flow.dataFlow.Flow
import io.typefox.sprotty.layout.ILayoutEngine
import io.typefox.sprotty.layout.LayoutUtil
import org.apache.log4j.Logger
import org.eclipse.elk.alg.layered.options.LayeredOptions
import org.eclipse.lsp4j.jsonrpc.CompletableFutures
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtext.ide.ExecutorServiceProvider
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.web.server.model.AbstractCachedService
import org.eclipse.xtext.web.server.model.IXtextWebDocument

import static io.typefox.sprotty.layout.ElkLayoutEngine.*

@Singleton
class ExecutionFlowDiagramServer extends AbstractCachedService<Program> implements DiagramServer, DiagramClientAware {
	
	static val LOG = Logger.getLogger(ExecutionFlowDiagramServer)
	
	@Inject ExecutorServiceProvider executorServiceProvider
	
	ILayoutEngine layoutEngine
	
	static Program cachedProgram
	
	@Accessors
	DiagramClient client
	
	override compute(IXtextWebDocument it, CancelIndicator cancelIndicator) {
		val flow = resource.contents.head as Flow
		val program = new Program => [
			type = 'graph'
			id = 'graph'
			children = newArrayList
		]
		if (flow !== null) {
			val nodes = newHashMap
			var index = 0
			// Transform executions
			for (declaration : flow.declarations.filter(Execution)) {
				val enode = new ExecutionNode
				enode.type = 'execution'
				enode.id = declaration.name + '_' + (index++)
				enode.taskName = declaration.task?.name
				enode.autosize = true
				nodes.put(declaration, enode)
				program.children += enode
			}
			// Transform barriers
			for (declaration : flow.declarations.filter(Barrier)) {
				val bnode = new BarrierNode
				bnode.type = 'barrier'
				bnode.id = 'barrier' + (index++)
				bnode.autosize = true
				nodes.put(declaration, bnode)
				program.children += bnode
				for (triggered : declaration.triggered) {
					val enode = new ExecutionNode
					enode.type = 'execution'
					enode.id = triggered.name + '_' + (index++)
					enode.taskName = triggered.task?.name
					enode.autosize = true
					nodes.put(triggered, enode)
					program.children += enode
				}
			}
			// Transform flows
			for (declaration : flow.declarations.filter(Barrier)) {
				for (joined : declaration.joined) {
					val edge = new SEdge
					edge.type = 'edge'
					edge.id = 'flow' + (index++)
					edge.sourceId = nodes.get(joined)?.id
					edge.targetId = nodes.get(declaration)?.id
					program.children += edge
				}
				for (triggered : declaration.triggered) {
					val edge = new SEdge
					edge.type = 'edge'
					edge.id = 'flow' + (index++)
					edge.sourceId = nodes.get(declaration)?.id
					edge.targetId = nodes.get(triggered)?.id
					program.children += edge
				}
			}
		}
		cachedProgram = program
		if (client !== null) {
			client.modelChanged(new UpdateModelAction => [
				modelId = program.id
			])
		}
		return program
	}
	
	protected def initializeLayoutEngine() {
		if (layoutEngine === null) {
			layoutEngine = new ExecutionFlowLayoutEngine => [
				initialize(new LayeredOptions)
			]
		}
	}
	
	override resize(ResizeAction action) {
		return CompletableFutures.computeAsync(executorServiceProvider.get) [
			initializeLayoutEngine()
			val graph = cachedProgram
			if (graph !== null) {
				LayoutUtil.applyResizeAction(graph, action)
				layoutEngine.layout(graph)
				return new SetModelAction => [
					newRoot = graph
				]
			} else
				throw new IllegalStateException("requestModel must be called before layout")
		]
	}
	
	/**
	 * Here the access to the computed program is hard-coded with a static field.
	 */
	override requestModel(RequestModelAction action) {
		return CompletableFutures.computeAsync(executorServiceProvider.get) [
			return new SetModelAction => [
				newRoot = cachedProgram ?: new Program
			]
		]
	}

	override elementSelected(SelectAction action) {
		LOG.info('element selected = ' + action)
	}
		
}
