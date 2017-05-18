/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api

import java.util.Map

class SModelIndex {
	
	val Map<String, SModelElement> index

	new(SModelElement parent) {
		index = newHashMap
		addToIndex(parent)
	}
	
	def SModelElement get(String elementId) {
		index.get(elementId)
	}
	
	protected def void addToIndex(SModelElement element) {
		index.put(element.id, element)
		element.children?.forEach[ addToIndex ]
	}
}