package io.typefox.sprotte.example.flow.web.diagram

import com.google.inject.Inject
import com.google.inject.Singleton
import io.typefox.sprotte.api.DiagramServer
import io.typefox.sprotte.api.RequestModelAction
import io.typefox.sprotte.api.ResizeAction
import io.typefox.sprotte.api.SEdge
import io.typefox.sprotte.api.SelectAction
import io.typefox.sprotte.api.SetModelAction
import io.typefox.sprotte.example.flow.dataFlow.Barrier
import io.typefox.sprotte.example.flow.dataFlow.Execution
import io.typefox.sprotte.example.flow.dataFlow.Flow
import io.typefox.sprotte.layout.ElkLayoutEngine
import io.typefox.sprotte.layout.ILayoutEngine
import io.typefox.sprotte.layout.LayoutUtil
import org.apache.log4j.Logger
import org.eclipse.elk.alg.layered.options.LayeredOptions
import org.eclipse.lsp4j.jsonrpc.CompletableFutures
import org.eclipse.xtext.ide.ExecutorServiceProvider
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.web.server.model.AbstractCachedService
import org.eclipse.xtext.web.server.model.IXtextWebDocument

import static io.typefox.sprotte.layout.ElkLayoutEngine.*

@Singleton
class ExecutionFlowDiagramServer extends AbstractCachedService<Program> implements DiagramServer {
	
	static val LOG = Logger.getLogger(ExecutionFlowDiagramServer)
	
	@Inject ExecutorServiceProvider executorServiceProvider
	
	ILayoutEngine layoutEngine
	
	static Program cachedProgram
	
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
				enode.id = 'execution' + (index++)
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
					enode.id = 'execution' + (index++)
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
		return program
	}
	
	protected def initializeLayoutEngine() {
		if (layoutEngine === null) {
			layoutEngine = new ElkLayoutEngine => [
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
