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
package org.eclipse.sprotty;

/**
 * Factory for hover popup contents. Invoked by {@link DefaultDiagramServer} when a hover popup is requested
 * by the client.
 */
public interface IPopupModelFactory {
	
	/**
	 * Create a model to be displayed in a hover popup. Return {@code null} if no popup should be shown for the
	 * given request.
	 * 
	 * @param element - the model element referenced by the request, or {@code null} if no such element exists
	 */
	SModelRoot createPopupModel(SModelElement element, RequestPopupModelAction request, IDiagramServer server);
	
	/**
	 * An implementation that does nothing.
	 */
	public static class NullImpl implements IPopupModelFactory {
		@Override
		public SModelRoot createPopupModel(SModelElement element, RequestPopupModelAction request,
				IDiagramServer server) {
			return null;
		}
	}

}
