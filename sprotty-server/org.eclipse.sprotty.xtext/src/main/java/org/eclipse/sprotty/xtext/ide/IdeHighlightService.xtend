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
package org.eclipse.sprotty.xtext.ide

import com.google.inject.Inject
import org.eclipse.sprotty.FitToScreenAction
import org.eclipse.sprotty.SModelElement
import org.eclipse.sprotty.SelectAction
import org.eclipse.sprotty.SelectAllAction
import org.eclipse.sprotty.xtext.DiagramLanguageServerExtension
import org.eclipse.sprotty.xtext.tracing.ITraceProvider
import org.eclipse.sprotty.xtext.tracing.TraceRegionProvider
import org.eclipse.xtext.ide.server.occurrences.DefaultDocumentHighlightService
import org.eclipse.xtext.resource.XtextResource

class IdeHighlightService extends DefaultDocumentHighlightService {

	@Inject extension DiagramLanguageServerExtension

	@Inject extension TraceRegionProvider

	@Inject extension ITraceProvider

	override getDocumentHighlights(XtextResource resource, int offset) {
		val result = super.getDocumentHighlights(resource, offset)
		findDiagramServersByUri(resource.getURI.toString).forEach [ server |
			val element = resource.getElementAtOffset(offset)
			val traceable = server.model.findTracable(element)
			if (traceable !== null) {
				server.dispatch(new SelectAllAction [
					select = false
				])
				server.dispatch(new SelectAction [
					selectedElementsIDs = #[(traceable as SModelElement).id]
				])
				server.dispatch(new FitToScreenAction [
					maxZoom = 1.0
					elementIds = #[(traceable as SModelElement).id]
				])
			}
		]
		return result
	}
}
