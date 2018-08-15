/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */ 
package org.eclipse.sprotty.xtext.ide

import org.eclipse.sprotty.xtext.DiagramEndpoint
import org.eclipse.lsp4j.Location
import org.eclipse.lsp4j.jsonrpc.services.JsonNotification
import org.eclipse.lsp4j.jsonrpc.services.JsonSegment
import org.eclipse.xtend.lib.annotations.Data

@JsonSegment('diagram')
interface IdeDiagramClient extends DiagramEndpoint {
	
	@JsonNotification
	def void openInTextEditor(OpenInTextEditorMessage message)
	
}

@Data
class OpenInTextEditorMessage {
	Location location
	boolean forceOpen
}