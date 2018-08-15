/********************************************************************************
 * Copyright (c) 2017-2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
package org.eclipse.sprotty.server.websocket;

import java.util.function.Consumer;

import javax.websocket.Endpoint;
import javax.websocket.EndpointConfig;
import javax.websocket.MessageHandler;
import javax.websocket.Session;

import org.eclipse.sprotty.IDiagramServer;
import org.eclipse.sprotty.server.json.ActionTypeAdapter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.eclipse.sprotty.ActionMessage;

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
