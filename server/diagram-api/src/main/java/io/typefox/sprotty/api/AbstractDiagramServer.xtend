package io.typefox.sprotty.api

import java.util.function.Consumer
import org.eclipse.xtend.lib.annotations.Accessors

abstract class AbstractDiagramServer implements Consumer<ActionMessage> {
	
	@Accessors
	Consumer<ActionMessage> remoteEndpoint
	
	override accept(ActionMessage message) {
		val action = message.action
		switch action.kind {
			case RequestModelAction.KIND:
				handle(action as RequestModelAction, message)
			case SetBoundsAction.KIND:
				handle(action as SetBoundsAction, message)
			case SelectAction.KIND:
				handle(action as SelectAction, message)
		}
	}
	
	def void handle(RequestModelAction action, ActionMessage message)
	
	def void handle(SetBoundsAction action, ActionMessage message)
	
	def void handle(SelectAction action, ActionMessage message)
	
}