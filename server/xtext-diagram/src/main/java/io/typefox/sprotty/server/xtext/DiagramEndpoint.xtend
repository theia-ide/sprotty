/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext

import io.typefox.sprotty.api.ActionMessage
import java.util.function.Consumer
import org.eclipse.lsp4j.jsonrpc.services.JsonNotification
import org.eclipse.lsp4j.jsonrpc.services.JsonSegment

/**
 * LSP4J binding for diagram endpoints (sprotty client and server).
 */
@JsonSegment('diagram')
interface DiagramEndpoint extends Consumer<ActionMessage> {

	/**
	 * Both client and server can accept arbitrary sprotty actions. Unsupported actions
	 * are ignored.
	 */
	@JsonNotification
	override accept(ActionMessage actionMessage);

}

/**
 * LSP4J binding for the diagram server.
 */
@JsonSegment('diagram')
interface DiagramServerEndpoint extends DiagramEndpoint {
	
	/**
	 * Sent by the client when a diagram has been closed. The server should release any
	 * resources associated with that diagram.
	 */
	@JsonNotification
	def void didClose(String clientId)
	
}
