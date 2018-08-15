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

import org.eclipse.sprotty.DefaultDiagramServer
import org.eclipse.sprotty.RequestModelAction
import org.eclipse.xtend.lib.annotations.Accessors

/**
 * Diagram server for Xtext languages. When a {@link RequestModelAction} is received,
 * a diagram is generated for the corresponding resource by calling
 * {@link DiagramLanguageServerExtension#updateDiagram(LanguageAwareDiagramServer)}.
 */
class LanguageAwareDiagramServer extends DefaultDiagramServer implements ILanguageAwareDiagramServer {
	
	public static val OPTION_SOURCE_URI = 'sourceUri'
	
	@Accessors
	DiagramLanguageServerExtension languageServerExtension
	
	override protected handle(RequestModelAction request) {
		if (model.type == 'NONE' && languageServerExtension !== null) {
			if (request.options !== null)
				options = request.options
			languageServerExtension.updateDiagram(this)
		} else {
			super.handle(request)
		}
	}
	
	override getSourceUri() {
		options.get(OPTION_SOURCE_URI)
	}
	
}