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