/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web

import io.typefox.sprotty.api.IDiagramExpansionListener
import io.typefox.sprotty.api.IDiagramOpenListener
import io.typefox.sprotty.api.IDiagramSelectionListener
import io.typefox.sprotty.api.IDiagramServer
import io.typefox.sprotty.api.ILayoutEngine
import io.typefox.sprotty.api.IModelUpdateListener
import io.typefox.sprotty.api.IPopupModelFactory
import io.typefox.sprotty.example.multicore.web.diagram.DiagramService
import io.typefox.sprotty.example.multicore.web.diagram.MulticoreAllocationDiagramServer
import io.typefox.sprotty.example.multicore.web.diagram.MulticoreAllocationLayoutEngine
import io.typefox.sprotty.example.multicore.web.diagram.MulticoreAllocationPopupModelFactory
import io.typefox.sprotty.example.multicore.web.diagram.MulticoreAllocationUpdateListener
import io.typefox.sprotty.example.multicore.web.selection.MulticoreOccurrencesService
import org.eclipse.xtext.web.server.XtextServiceDispatcher
import org.eclipse.xtext.web.server.model.IWebDocumentProvider
import org.eclipse.xtext.web.server.occurrences.OccurrencesService

/**
 * Use this class to register additional components to be used within the web application.
 */
class MulticoreAllocationWebModule extends AbstractMulticoreAllocationWebModule {
	
	def Class<? extends XtextServiceDispatcher> bindXtextServiceDispatcher() {
		MulticoreAllocationServiceDispatcher
	}
	
	def Class<? extends IWebDocumentProvider> bindIWebDocumentProvider() {
		WebDocumentProvider
	}
	
	def Class<? extends OccurrencesService> bindOccurrencesService() {
		MulticoreOccurrencesService
	}
	
	def Class<? extends IDiagramServer.Provider> bindIDiagramServerProvider() {
		DiagramService
	}
	
	def Class<? extends IDiagramServer> bindIDiagramServer() {
		MulticoreAllocationDiagramServer
	}
	
	def Class<? extends IModelUpdateListener> bindIModelUpdateListener() {
		MulticoreAllocationUpdateListener
	}
	
	def Class<? extends ILayoutEngine> bindILayoutEngine() {
		MulticoreAllocationLayoutEngine
	}
	
	def Class<? extends IPopupModelFactory> bindIPopupModelFactory() {
		MulticoreAllocationPopupModelFactory
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
	
}
