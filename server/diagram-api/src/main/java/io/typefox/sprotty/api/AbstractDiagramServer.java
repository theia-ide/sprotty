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
			remoteEndpoint.accept(new ActionMessage(clientId, action));
		}
	}
	
	@Override
	public void accept(ActionMessage message) {
		Action action = message.getAction();
		switch (action.getKind()) {
			case RequestModelAction.KIND:
				handle((RequestModelAction) action, message);
				break;
			case RequestPopupModelAction.KIND:
				handle((RequestPopupModelAction) action, message);
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
		SModelRoot model = getModel(request, message.getClientId());
		if (model != null) {
			sendModel(model, null, message.getClientId());
		}
	}
	
	protected abstract SModelRoot getModel(ModelAction action, String clientId);
	
	protected abstract boolean needsServerLayout(SModelRoot root);
	
	protected abstract boolean needsClientLayout(SModelRoot root);
	
	protected void sendModel(SModelRoot newRoot, SModelRoot oldRoot, String clientId) {
		if (needsServerLayout(newRoot) || needsClientLayout(newRoot)) {
			sendAction(new RequestBoundsAction(newRoot), clientId);
			if (needsClientLayout(newRoot))
				modelSent(newRoot, oldRoot, clientId);
		} else if (oldRoot == null) {
			sendAction(new SetModelAction(newRoot), clientId);
			modelSent(newRoot, oldRoot, clientId);
		} else {
			sendAction(new UpdateModelAction(newRoot), clientId);
			modelSent(newRoot, oldRoot, clientId);
		}
	}
	
	protected void modelSent(SModelRoot newRoot, SModelRoot oldRoot, String clientId) {
	}
	
	protected void handle(RequestPopupModelAction request, ActionMessage message) {
		SModelRoot model = getModel(request, message.getClientId());
		SModelIndex index = new SModelIndex(model);
		SModelElement element = index.get(request.getElementId());
		if (element != null) {
			SModelRoot popupModel = getPopupModel(element, model, request, message.getClientId());
			if (popupModel != null) {
				sendAction(new SetPopupModelAction(popupModel), message.getClientId());
			}
		}
	}
	
	protected SModelRoot getPopupModel(SModelElement element, SModelRoot model, RequestPopupModelAction request, String clientId) {
		return null;
	}
	
	protected void handle(ComputedBoundsAction computedBounds, ActionMessage message) {
		SModelRoot root = getModel(computedBounds, message.getClientId());
		if (root != null) {
			computeLayout(root, computedBounds);
			sendAction(new UpdateModelAction(root), message.getClientId());
			modelSent(root, root, message.getClientId());
		}
	}
	
	protected abstract void computeLayout(SModelRoot root, ComputedBoundsAction computedBounds);
	
	protected void handle(SelectAction select, ActionMessage message) {
	}
	
}
