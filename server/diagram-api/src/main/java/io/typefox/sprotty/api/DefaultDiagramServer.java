/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api;

import java.util.function.Consumer;

import javax.inject.Inject;

/**
 * Default diagram server implementation that realizes the same message protocol as the
 * TypeScript class {@code LocalModelSource}.
 */
public class DefaultDiagramServer implements IDiagramServer {
	
	private String clientId;
	
	private SModelRoot currentRoot;
	
	private Consumer<ActionMessage> remoteEndpoint;
	
	private IModelUpdateListener modelUpdateListener;
	
	private ILayoutEngine layoutEngine;
	
	private IPopupModelFactory popupModelFactory;
	
	private IDiagramSelectionListener diagramSelectionListener;
	
	public DefaultDiagramServer() {
		currentRoot = new SModelRoot();
		currentRoot.setType("NONE");
		currentRoot.setId("ROOT");
	}
	
	public DefaultDiagramServer(String clientId) {
		this.clientId = clientId;
	}
	
	@Override
	public String getClientId() {
		return clientId;
	}
	
	public void setClientId(String clientId) {
		this.clientId = clientId;
	}
	
	@Override
	public Consumer<ActionMessage> getRemoteEndpoint() {
		return remoteEndpoint;
	}
	
	@Override
	public void setRemoteEndpoint(Consumer<ActionMessage> remoteEndpoint) {
		this.remoteEndpoint = remoteEndpoint;
	}
	
	protected IModelUpdateListener getModelUpdateListener() {
		return modelUpdateListener;
	}
	
	@Inject
	public void setModelUpdateListener(IModelUpdateListener listener) {
		this.modelUpdateListener = listener;
	}
	
	protected ILayoutEngine getLayoutEngine() {
		return layoutEngine;
	}
	
	@Inject
	public void setLayoutEngine(ILayoutEngine engine) {
		this.layoutEngine = engine;
	}
	
	protected IPopupModelFactory getPopupModelFactory() {
		return popupModelFactory;
	}
	
	@Inject
	public void setPopupModelFactory(IPopupModelFactory factory) {
		this.popupModelFactory = factory;
	}
	
	protected IDiagramSelectionListener getSelectionListener() {
		return diagramSelectionListener;
	}
	
	@Inject
	public void setSelectionListener(IDiagramSelectionListener listener) {
		this.diagramSelectionListener = listener;
	}
	
	@Override
	public void dispatch(Action action) {
		if (remoteEndpoint != null) {
			remoteEndpoint.accept(new ActionMessage(clientId, action));
		}
	}
	
	@Override
	public SModelRoot getModel() {
		return currentRoot;
	}
	
	@Override
	public void setModel(SModelRoot newRoot) {
		if (newRoot == null)
			throw new NullPointerException();
		this.currentRoot = newRoot;
		submitModel(newRoot, false);
	}
	
	@Override
	public void updateModel(SModelRoot newRoot) {
		if (newRoot == null) {
			submitModel(this.currentRoot, true);
		} else {
			this.currentRoot = newRoot;
			submitModel(newRoot, true);
		}
	}
	
	/**
	 * Whether the client needs to compute the layout of parts of the model.
	 */
	protected boolean needsClientLayout(SModelRoot root) {
		// Override in subclasses
		return true;
	}
	
	/**
	 * Whether the server needs to compute the layout of parts of the model.
	 */
	protected boolean needsServerLayout(SModelRoot root) {
		// Override in subclasses
		return false;
	}
	
	/**
	 * Submit a new or updated model to the client. If client layout is required, a {@code RequestBoundsAction}
	 * is sent, otherwise either a {@code SetModelAction} or an {@code UpdateModelAction} is sent depending on
	 * whether {@code oldRoot} is {@code null} or not.
	 */
	protected void submitModel(SModelRoot newRoot, boolean update) {
		IModelUpdateListener listener = getModelUpdateListener();
		if (needsClientLayout(newRoot)) {
			dispatch(new RequestBoundsAction(newRoot));
			if (!needsServerLayout(newRoot) && listener != null) {
				// In this case the client is expected to apply the computed bounds, so we trigger the listener immediately
				listener.modelSubmitted(newRoot, this);
			}
		} else {
			if (needsServerLayout(newRoot)) {
				ILayoutEngine layoutEngine = getLayoutEngine();
				if (layoutEngine != null) {
					layoutEngine.layout(newRoot);
				}
			}
			if (update) {
				dispatch(new UpdateModelAction(newRoot));
			} else {
				dispatch(new SetModelAction(newRoot));
			}
			if (listener != null) {
				listener.modelSubmitted(newRoot, this);
			}
		}
	}
	
	@Override
	public void accept(ActionMessage message) {
		if (this.clientId.equals(message.getClientId())) {
			Action action = message.getAction();
			switch (action.getKind()) {
				case RequestModelAction.KIND:
					handle((RequestModelAction) action);
					break;
				case RequestPopupModelAction.KIND:
					handle((RequestPopupModelAction) action);
					break;
				case ComputedBoundsAction.KIND:
					handle((ComputedBoundsAction) action);
					break;
				case SelectAction.KIND:
					handle((SelectAction) action);
					break;
			}
		}
	}
	
	/**
	 * Called when a {@code RequestModelAction} is received.
	 */
	protected void handle(RequestModelAction request) {
		SModelRoot model = getModel();
		if (model != null) {
			submitModel(model, false);
		}
	}
	
	/**
	 * Called when a {@code ComputedBoundsAction} is received.
	 */
	protected void handle(ComputedBoundsAction computedBounds) {
		SModelRoot model = getModel();
		if (model != null) {
			LayoutUtil.applyBounds(model, computedBounds);
			if (needsServerLayout(model)) {
				ILayoutEngine layoutEngine = getLayoutEngine();
				if (layoutEngine != null) {
					layoutEngine.layout(model);
				}
			}
			dispatch(new UpdateModelAction(model));
			IModelUpdateListener listener = getModelUpdateListener();
			if (listener != null) {
				listener.modelSubmitted(model, this);
			}
		}
	}
	
	/**
	 * Called when a {@code RequestPopupModelAction} is received.
	 */
	protected void handle(RequestPopupModelAction request) {
		SModelRoot model = getModel();
		SModelElement element = SModelIndex.find(model, request.getElementId());
		IPopupModelFactory factory = getPopupModelFactory();
		if (factory != null) {
			SModelRoot popupModel = factory.createPopupModel(element, request, this);
			if (popupModel != null) {
				dispatch(new SetPopupModelAction(popupModel));
			}
		}
	}
	
	/**
	 * Called when a {@code SelectAction} is received.
	 */
	protected void handle(SelectAction action) {
		IDiagramSelectionListener selectionListener = getSelectionListener();
		if (selectionListener != null) {
			selectionListener.selectionChanged(action, this);
		}
	}
	
}
