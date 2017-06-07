/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.websocket;

import java.util.function.Consumer;

import javax.websocket.Endpoint;
import javax.websocket.EndpointConfig;
import javax.websocket.MessageHandler;
import javax.websocket.Session;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.typefox.sprotty.api.ActionMessage;
import io.typefox.sprotty.api.IDiagramServer;
import io.typefox.sprotty.server.json.ActionTypeAdapter;

/**
 * A websocket endpoint to connect a diagram server with a sprotty client.
 */
public class DiagramServerEndpoint extends Endpoint implements Consumer<ActionMessage> {
	
	private Session session;
	
	private Gson gson;
	
	private IDiagramServer.Provider diagramServerProvider;
	
	private Consumer<Exception> exceptionHandler;
	
	protected Session getSession() {
		return session;
	}
	
	public void setGson(Gson gson) {
		this.gson = gson;
	}
	
	public void setDiagramServerProvider(IDiagramServer.Provider diagramServerProvider) {
		this.diagramServerProvider = diagramServerProvider;
	}
	
	public void setExceptionHandler(Consumer<Exception> exceptionHandler) {
		this.exceptionHandler = exceptionHandler;
	}
	
	@Override
	public void onOpen(Session session, EndpointConfig config) {
		this.session = session;
		session.addMessageHandler(new ActionMessageHandler());
	}
	
	protected void fireMessageReceived(ActionMessage message) {
		IDiagramServer diagramServer = diagramServerProvider.getDiagramServer(message.getClientId());
		if (diagramServer != null) {
			if (!this.equals(diagramServer.getRemoteEndpoint())) {
				diagramServer.setRemoteEndpoint(this);
			}
			diagramServer.accept(message);
		}
	}
	
	protected void fireError(Exception message) {
		exceptionHandler.accept(message);
	}
	
	protected void initializeGson() {
		if (gson == null) {
			GsonBuilder builder = new GsonBuilder();
			ActionTypeAdapter.configureGson(builder);
			gson = builder.create();
		}
	}
	
	@Override
	public void accept(ActionMessage message) {
		initializeGson();
		String json = gson.toJson(message, ActionMessage.class);
		session.getAsyncRemote().sendText(json);
	}
	
	protected class ActionMessageHandler implements MessageHandler.Whole<String> {
		@Override
		public void onMessage(String message) {
			try {
				initializeGson();
				ActionMessage actionMessage = gson.fromJson(message, ActionMessage.class);
				if (actionMessage.getAction() == null)
					fireError(new IllegalArgumentException("Property 'action' must be set."));
				else
					fireMessageReceived(actionMessage);
			} catch (Exception exception) {
				fireError(exception);
			}
		}
	}

}
