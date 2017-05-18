/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.websocket;

import javax.websocket.Session;

import io.typefox.sprotty.api.ActionMessage;

public class WebsocketActionMessage extends ActionMessage {
	
	private final Session session;
	
	public WebsocketActionMessage(ActionMessage message, Session session) {
		this.session = session;
		this.setClientId(message.getClientId());
		this.setAction(message.getAction());
	}
	
	public Session getSession() {
		return session;
	}

}
