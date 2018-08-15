/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext

import io.typefox.sprotty.api.IDiagramState
import io.typefox.sprotty.api.SModelRoot
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

