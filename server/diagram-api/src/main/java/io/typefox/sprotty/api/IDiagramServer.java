/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api;

import java.util.function.Consumer;

/**
 * A diagram server can be connected to the action stream of a Sprotty view.
 * This is the Java representation of the backend accessed via the TypeScript class {@code DiagramServer}
 * in the client. An instance of this interface is always bound to one Sprotty client, which is
 * identified with its {@code clientId} string. In most cases a diagram server is stateful, since it
 * remembers the current model, and possibly further information required for building that model.
 */
public interface IDiagramServer extends Consumer<ActionMessage> {
	
	/**
	 * A string used to uniquely identify the Sprotty view and its corresponding server instance.
	 */
	String getClientId();
	
	void setClientId(String clientId);
	
	/**
	 * The endpoint to which messages are sent by this server.
	 */
	Consumer<ActionMessage> getRemoteEndpoint();
	
	void setRemoteEndpoint(Consumer<ActionMessage> remoteEndpoint);
	
	/**
	 * Dispatch the given action to the client.
	 */
	void dispatch(Action action);
	
	/**
	 * The current model, represented by its root element.
	 */
	SModelRoot getModel();
	
	/**
	 * Set the current model and send it to the client, if a remote endpoint has been configured.
	 */
	void setModel(SModelRoot root);
	
	/**
	 * Set the current model and send an update to the client, if a remote endpoint has been configured.
	 * The main difference to {@link #setModel(SModelRoot)} is that with this method the change will be
	 * animated in the client.
	 */
	void updateModel(SModelRoot root);
	
	/**
	 * A diagram server provider creates a diagram server for a given {@code clientId} or returns
	 * an already existing one.
	 */
	public interface Provider {
		/**
		 * Returns a diagram server, or {@code null} if no server is available for the given {@code clientId}.
		 */
		IDiagramServer getDiagramServer(String clientId);
	}

}
