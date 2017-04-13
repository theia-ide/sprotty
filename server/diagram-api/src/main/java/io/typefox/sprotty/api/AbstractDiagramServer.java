package io.typefox.sprotty.api;

import java.util.function.Consumer;

public abstract class AbstractDiagramServer implements Consumer<ActionMessage> {
	
	private Consumer<ActionMessage> remoteEndpoint;
	
	public void setRemoteEndpoint(Consumer<ActionMessage> remoteEndpoint) {
		this.remoteEndpoint = remoteEndpoint;
	}
	
	public Consumer<ActionMessage> getRemoteEndpoint() {
		return remoteEndpoint;
	}
	
	protected void sendAction(Action action, String clientId) {
		if (remoteEndpoint != null) {
			remoteEndpoint.accept(new ActionMessage( out -> {
				out.setClientId(clientId);
				out.setAction(action);
			}));
		}
	}
	
	@Override
	public void accept(ActionMessage message) {
		Action action = message.getAction();
		switch (action.getKind()) {
			case RequestModelAction.KIND:
				handle((RequestModelAction) action, message);
				break;
			case ComputedBoundsAction.KIND:
				handle((ComputedBoundsAction) action, message);
				break;
			case SelectAction.KIND:
				handle((SelectAction) action, message);
				break;
		}
	}
	
	protected void handle(RequestModelAction request, ActionMessage message) {
		SModelRoot root = getModel(message);
		if (root != null) {
			sendModel(root, message.getClientId());
		}
	}
	
	protected abstract SModelRoot getModel(ActionMessage message);
	
	protected abstract boolean needsLayout(SModelRoot root);
	
	protected void sendModel(SModelRoot root, String clientId) {
		if (needsLayout(root)) {
			sendAction(new RequestBoundsAction( action -> {
				action.setRoot(root);
			}), clientId);
		} else {
			sendAction(new SetModelAction( action -> {
				action.setModelType(root.getType());
				action.setModelId(root.getId());
				action.setNewRoot(root);
			}), clientId);
		}
	}
	
	protected void handle(ComputedBoundsAction computedBounds, ActionMessage message) {
		SModelRoot root = getModel(message);
		if (root != null) {
			computeLayout(root, computedBounds);
			sendAction(new UpdateModelAction( update -> {
				update.setModelType(root.getType());
				update.setModelId(root.getId());
				update.setNewRoot(root);
			}), message.getClientId());
		}
	}
	
	protected abstract void computeLayout(SModelRoot root, ComputedBoundsAction computedBounds);
	
	protected void handle(SelectAction select, ActionMessage message) {
	}
	
}
