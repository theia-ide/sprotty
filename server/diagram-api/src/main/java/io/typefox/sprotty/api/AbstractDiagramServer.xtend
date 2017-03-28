package io.typefox.sprotty.api

import java.util.function.Consumer
import org.eclipse.xtend.lib.annotations.Accessors

abstract class AbstractDiagramServer implements Consumer<Action> {
	
	@Accessors
	Consumer<Action> remoteEndpoint
	
	override accept(Action action) {
		switch action.kind {
			case RequestModelAction.KIND:
				handle(action as RequestModelAction)
			case ResizeAction.KIND:
				handle(action as ResizeAction)
			case SelectAction.KIND:
				handle(action as SelectAction)
		}
	}
	
	def void handle(RequestModelAction action)
	
	def void handle(ResizeAction action)
	
	def void handle(SelectAction action)
	
}