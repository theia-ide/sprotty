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
			sendModel(null, root, message.getClientId(), true);
		}
	}
	
	protected abstract SModelRoot getModel(ActionMessage message);
	
	protected abstract boolean needsLayout(SModelRoot root);
	
	protected void sendModel(SModelRoot newRoot, SModelRoot oldRoot, String clientId, boolean initial) {
		if (needsLayout(newRoot)) {
			sendAction(new RequestBoundsAction( action -> {
				action.setRoot(newRoot);
			}), clientId);
		} else if (initial) {
			sendAction(new SetModelAction( action -> {
				action.setModelType(newRoot.getType());
				action.setModelId(newRoot.getId());
				action.setNewRoot(newRoot);
			}), clientId);
			modelSent(oldRoot, newRoot, clientId, initial);
		} else {
			sendAction(new UpdateModelAction( action -> {
				action.setModelType(newRoot.getType());
				action.setModelId(newRoot.getId());
				action.setNewRoot(newRoot);
			}), clientId);
			modelSent(newRoot, oldRoot, clientId, initial);
		}
	}
	
	protected void modelSent(SModelRoot newRoot, SModelRoot oldRoot, String clientId, boolean initial) {
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
			modelSent(root, root, message.getClientId(), false);
		}
	}
	
	protected abstract void computeLayout(SModelRoot root, ComputedBoundsAction computedBounds);
	
	protected void handle(SelectAction select, ActionMessage message) {
	}
	
}
