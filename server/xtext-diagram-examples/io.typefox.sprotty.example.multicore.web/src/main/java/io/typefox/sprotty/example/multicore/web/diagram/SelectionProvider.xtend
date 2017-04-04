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