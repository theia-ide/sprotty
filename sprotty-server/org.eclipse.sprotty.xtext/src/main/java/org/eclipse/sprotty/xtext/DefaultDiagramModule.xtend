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

import org.eclipse.sprotty.IDiagramExpansionListener
import org.eclipse.sprotty.IDiagramSelectionListener
import org.eclipse.sprotty.IDiagramServer
import org.eclipse.sprotty.ILayoutEngine
import org.eclipse.sprotty.IModelUpdateListener
import org.eclipse.sprotty.IPopupModelFactory
import org.eclipse.sprotty.xtext.tracing.ITraceProvider
import org.eclipse.sprotty.xtext.tracing.UriTraceProvider
import org.eclipse.xtext.ide.server.ILanguageServerExtension
import org.eclipse.xtext.service.AbstractGenericModule
import org.eclipse.sprotty.IDiagramOpenListener

/**
 * Guice bindings for sprotty diagrams. Include this module in your Guice configuration in
 * order to support sprotty messages in the language server.
 */
class DefaultDiagramModule extends AbstractGenericModule {
	
	def Class<? extends ILanguageServerExtension> bindILanguageServerExtension() {
		DiagramLanguageServerExtension
	}
	
	def Class<? extends IDiagramServer.Provider> bindIDiagramServerProvider() {
		DiagramLanguageServerExtension
	}
	
	def Class<? extends IDiagramServer> bindIDiagramServer() {
		LanguageAwareDiagramServer
	}
	
	def Class<? extends ILayoutEngine> bindILayoutEngine() {
		ILayoutEngine.NullImpl
	}
	
	def Class<? extends IPopupModelFactory> bindIPopupModelFactory() {
		IPopupModelFactory.NullImpl
	}
	
	def Class<? extends IModelUpdateListener> bindIModelUpdateListener() {
		IModelUpdateListener.NullImpl
	}
	
	def Class<? extends IDiagramSelectionListener> bindIDiagramSelectionListener() {
		IDiagramSelectionListener.NullImpl
	}
	
	def Class<? extends IDiagramExpansionListener> bindIDiagramExpansionListener() {
		IDiagramExpansionListener.NullImpl
	}
	
	def Class<? extends IDiagramOpenListener> bindIDiagramOpenListener() {
		IDiagramOpenListener.NullImpl
	}
	
	def Class<? extends ITraceProvider> bindTraceProvider() {
		UriTraceProvider
	}
}