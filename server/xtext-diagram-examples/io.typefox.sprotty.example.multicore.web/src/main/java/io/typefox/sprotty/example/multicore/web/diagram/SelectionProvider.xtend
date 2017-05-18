/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web.diagram

import java.util.Map
import org.eclipse.emf.ecore.EObject

class SelectionProvider {
	
	/** resource id -> selection */
	val Map<String, EObject> selectedElements = newHashMap
	
	def EObject getSelection(String resourceId) {
		synchronized (selectedElements) {
			selectedElements.get(resourceId)
		}
	}
	
	def void setSelection(String resourceId, EObject selectedElement) {
		synchronized (selectedElements) {
			selectedElements.put(resourceId, selectedElement)
		}
	}
	
	def clear(String resourceId) {
		synchronized (selectedElements) {
			selectedElements.remove(resourceId)
		}
	}
	
}