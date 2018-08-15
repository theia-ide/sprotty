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
package org.eclipse.sprotty.xtext

import org.eclipse.sprotty.ActionMessage
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
