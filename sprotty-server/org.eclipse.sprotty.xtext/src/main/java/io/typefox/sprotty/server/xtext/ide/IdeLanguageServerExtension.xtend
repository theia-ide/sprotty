/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */ 
package io.typefox.sprotty.server.xtext.ide

import io.typefox.sprotty.server.xtext.DiagramLanguageServerExtension
import org.eclipse.lsp4j.jsonrpc.Endpoint
import org.eclipse.lsp4j.jsonrpc.services.ServiceEndpoints

class IdeLanguageServerExtension extends DiagramLanguageServerExtension {

	IdeDiagramClient _client
	
	override protected IdeDiagramClient getClient() {
		if (_client === null) {
			val client = languageServerAccess.languageClient
			if (client instanceof Endpoint) {
				_client = ServiceEndpoints.toServiceObject(client, IdeDiagramClient)
			}
		}
		return _client
	}
}
