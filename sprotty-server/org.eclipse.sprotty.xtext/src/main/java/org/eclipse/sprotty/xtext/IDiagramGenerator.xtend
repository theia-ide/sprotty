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

import org.eclipse.sprotty.IDiagramState
import org.eclipse.sprotty.SModelRoot
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.util.CancelIndicator

/**
 * A diagram generator creates a sprotty model for a given resource. Bind your implementation in a subclass
 * of {@link DefaultDiagramModule} in order to include it in the {@link DiagramLanguageServerExtension}.
 */
interface IDiagramGenerator {
	
	/**
	 * Create a sprotty model for the given resource. May return {@code null} if no diagram should be
	 * displayed for that resource.
	 */
	def SModelRoot generate(Resource resource, IDiagramState state, CancelIndicator cancelIndicator)

}

