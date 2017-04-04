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
