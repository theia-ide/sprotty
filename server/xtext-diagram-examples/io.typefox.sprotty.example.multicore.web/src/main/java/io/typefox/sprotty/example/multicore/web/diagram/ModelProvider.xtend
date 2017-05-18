/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web.diagram

import com.google.common.collect.BiMap
import com.google.inject.Singleton
import io.typefox.sprotty.api.SModelElement
import io.typefox.sprotty.api.SModelRoot
import java.util.Map
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtend.lib.annotations.ToString
import org.eclipse.xtext.web.server.IServiceResult

/**
 * Here the access to the models is hard-coded with a singleton provider.
 */
@Singleton
@ToString
class ModelProvider implements IServiceResult {
	
	/** (resource id, model type) -> model entry */
	val Map<Pair<String, String>, ModelEntry> cachedModels = newHashMap
	
	def SModelRoot getModel(String resourceId, String modelType) {
		synchronized (cachedModels) {
			cachedModels.get(Pair.of(resourceId, modelType))?.root
		}
	}
	
	def BiMap<EObject, SModelElement> getMapping(String resourceId, String modelType) {
		synchronized (cachedModels) {
			cachedModels.get(Pair.of(resourceId, modelType))?.mapping
		}
	}
	
	def void putModel(String resourceId, SModelRoot model, BiMap<EObject, SModelElement> mapping) {
		synchronized (cachedModels) {
			val key = Pair.of(resourceId, model.type)
			var entry = cachedModels.get(key)
			if (entry === null) {
				entry = new ModelEntry
				cachedModels.put(key, entry)
			}
			entry.root = model
			entry.mapping = mapping
			entry.layoutDone = false
		}
	}
	
	def boolean isLayoutDone(String resourceId, String modelType) {
		synchronized (cachedModels) {
			val entry = cachedModels.get(Pair.of(resourceId, modelType))
			if (entry !== null)
				return entry.layoutDone
			else
				return false
		}
	}
	
	def void setLayoutDone(String resourceId, String modelType) {
		synchronized (cachedModels) {
			val entry = cachedModels.get(Pair.of(resourceId, modelType))
			if (entry !== null)
				entry.layoutDone = true
		}
	}
	
	def clear(String resourceId) {
		synchronized (cachedModels) {
			val iterator = cachedModels.entrySet.iterator
			while (iterator.hasNext) {
				val entry = iterator.next()
				if (entry.key.key == resourceId) {
					iterator.remove()
				}
			}
		}
	}
	
	private static class ModelEntry {
		SModelRoot root
		BiMap<EObject, SModelElement> mapping
		boolean layoutDone
	}
	
}
