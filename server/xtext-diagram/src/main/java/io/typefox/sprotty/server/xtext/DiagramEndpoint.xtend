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

@JsonSegment('diagram')
interface DiagramEndpoint extends Consumer<ActionMessage> {

	@JsonNotification
	override accept(ActionMessage actionMessage);

}

@JsonSegment('diagram')
interface DiagramServer extends DiagramEndpoint {
	
	@JsonNotification
	def void didClose(String clientId)
	
}
