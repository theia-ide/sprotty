/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext

import io.typefox.sprotty.api.IDiagramExpansionListener
import io.typefox.sprotty.api.IDiagramSelectionListener
import io.typefox.sprotty.api.IDiagramServer
import io.typefox.sprotty.api.ILayoutEngine
import io.typefox.sprotty.api.IModelUpdateListener
import io.typefox.sprotty.api.IPopupModelFactory
import io.typefox.sprotty.server.xtext.tracing.ITraceProvider
import io.typefox.sprotty.server.xtext.tracing.UriTraceProvider
import org.eclipse.xtext.ide.server.ILanguageServerExtension
import org.eclipse.xtext.service.AbstractGenericModule
import io.typefox.sprotty.api.IDiagramOpenListener

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