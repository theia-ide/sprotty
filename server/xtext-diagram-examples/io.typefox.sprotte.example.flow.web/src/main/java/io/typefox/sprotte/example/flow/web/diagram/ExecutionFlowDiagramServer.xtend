package io.typefox.sprotte.example.flow.web.diagram

import com.google.inject.Inject
import com.google.inject.Singleton
import io.typefox.sprotte.api.DiagramServer
import io.typefox.sprotte.api.RequestModelAction
import io.typefox.sprotte.api.SelectAction
import io.typefox.sprotte.api.SetModelAction
import io.typefox.sprotte.example.flow.dataFlow.Flow
import org.apache.log4j.Logger
import org.eclipse.lsp4j.jsonrpc.CompletableFutures
import org.eclipse.xtext.ide.ExecutorServiceProvider
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.web.server.model.AbstractCachedService
import org.eclipse.xtext.web.server.model.IXtextWebDocument
import io.typefox.sprotte.example.flow.dataFlow.Execution
import io.typefox.sprotte.example.flow.dataFlow.Barrier
import io.typefox.sprotte.api.SEdge

@Singleton
class ExecutionFlowDiagramServer extends AbstractCachedService<Program> implements DiagramServer {
	
	static val LOG = Logger.getLogger(ExecutionFlowDiagramServer)
	
	@Inject ExecutorServiceProvider executorServiceProvider
	
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
				enode.type = 'node:execution'
				enode.id = 'node' + (index++)
				enode.taskName = declaration.task?.name
				nodes.put(declaration, enode)
				program.children += enode
			}
			// Transform barriers
			for (declaration : flow.declarations.filter(Barrier)) {
				val bnode = new BarrierNode
				bnode.type = 'node:barrier'
				bnode.id = 'node' + (index++)
				nodes.put(declaration, bnode)
				program.children += bnode
				for (triggered : declaration.triggered) {
					val enode = new ExecutionNode
					enode.type = 'node:execution'
					enode.id = 'node' + (index++)
					enode.taskName = triggered.task?.name
					nodes.put(triggered, enode)
					program.children += enode
				}
			}
			// Transform flows
			for (declaration : flow.declarations.filter(Barrier)) {
				for (joined : declaration.joined) {
					val edge = new SEdge
					edge.type = 'edge:straight'
					edge.id = 'edge' + (index++)
					edge.sourceId = nodes.get(joined)?.id
					edge.targetId = nodes.get(declaration)?.id
					program.children += edge
				}
				for (triggered : declaration.triggered) {
					val edge = new SEdge
					edge.type = 'edge:straight'
					edge.id = 'edge' + (index++)
					edge.sourceId = nodes.get(declaration)?.id
					edge.targetId = nodes.get(triggered)?.id
					program.children += edge
				}
			}
		}
		cachedProgram = program
		return program
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
