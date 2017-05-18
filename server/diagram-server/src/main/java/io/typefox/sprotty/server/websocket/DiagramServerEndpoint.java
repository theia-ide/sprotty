/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.websocket;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

import javax.websocket.Endpoint;
import javax.websocket.EndpointConfig;
import javax.websocket.MessageHandler;
import javax.websocket.Session;

import com.google.gson.Gson;

import io.typefox.sprotty.api.ActionMessage;
import io.typefox.sprotty.server.json.ActionTypeAdapter;

public class DiagramServerEndpoint extends Endpoint implements Consumer<ActionMessage> {
	
	private Session session;
	
	private Gson gson;
	
	private final List<Consumer<ActionMessage>> actionListeners = new ArrayList<>();
	
	private final List<Consumer<Exception>> errorListeners = new ArrayList<>();
	
	protected Session getSession() {
		return session;
	}
	
	public void setGson(Gson gson) {
		this.gson = gson;
	}
	
	@Override
	public void onOpen(Session session, EndpointConfig config) {
		this.session = session;
		session.addMessageHandler(new ActionMessageHandler());
	}
	
	public void addActionListener(Consumer<ActionMessage> listener) {
		synchronized (actionListeners) {
			this.actionListeners.add(listener);
		}
	}
	
	public void removeActionListener(Consumer<ActionMessage> listener) {
		synchronized (actionListeners) {
			this.actionListeners.remove(listener);
		}
	}
	
	public void addErrorListener(Consumer<Exception> listener) {
		synchronized (errorListeners) {
			this.errorListeners.add(listener);
		}
	}
	
	public void removeErrorListener(Consumer<Exception> listener) {
		synchronized (errorListeners) {
			this.errorListeners.remove(listener);
		}
	}
	
	@SuppressWarnings("unchecked")
	protected void fireMessageReceived(ActionMessage message) {
		WebsocketActionMessage wrapperMessage = new WebsocketActionMessage(message, session);
		Consumer<ActionMessage>[] listenerArray;
		synchronized (actionListeners) {
			listenerArray = actionListeners.toArray(new Consumer[actionListeners.size()]);
		}
		for (Consumer<ActionMessage> listener : listenerArray) {
			listener.accept(wrapperMessage);
		}
	}
	
	@SuppressWarnings("unchecked")
	protected void fireError(Exception message) {
		Consumer<Exception>[] listenerArray;
		synchronized (errorListeners) {
			listenerArray = errorListeners.toArray(new Consumer[errorListeners.size()]);
		}
		for (Consumer<Exception> listener : listenerArray) {
			listener.accept(message);
		}
	}
	
	protected void initializeGson() {
		if (gson == null) {
			gson = ActionTypeAdapter.createDefaultGson();
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
				fireMessageReceived(actionMessage);
			} catch (Exception exception) {
				fireError(exception);
			}
		}
	}

}
