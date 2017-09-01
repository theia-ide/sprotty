/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web.diagram

import com.google.common.collect.BiMap
import io.typefox.sprotty.api.DefaultDiagramServer
import io.typefox.sprotty.api.SModelElement
import io.typefox.sprotty.api.SModelRoot
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtend.lib.annotations.Accessors

class MulticoreAllocationDiagramServer extends DefaultDiagramServer {
	
	@Accessors
	EObject selection
	
	@Accessors
	BiMap<EObject, SModelElement> modelMapping
	
	override protected needsServerLayout(SModelRoot root) {
		switch root.type {
			case 'flow': true
			default: false
		}
	}
	
}