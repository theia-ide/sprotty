package io.typefox.sprotty.example.multicore.web.diagram

import com.google.inject.Singleton
import io.typefox.sprotty.api.SModelRoot
import java.util.Map
import org.eclipse.xtend.lib.annotations.ToString
import org.eclipse.xtext.web.server.IServiceResult

/**
 * Here the access to the models is hard-coded with a singleton provider.
 */
@Singleton
@ToString
class ModelProvider implements IServiceResult {
	
	/** (resource id, model type) -> model */
	val Map<Pair<String, String>, SModelRoot> cachedModels = newHashMap 
	
	def SModelRoot getModel(String resourceId, String modelType) {
		synchronized (cachedModels) {
			cachedModels.get(Pair.of(resourceId, modelType))
		}
	}
	
	def void putModel(String resourceId, SModelRoot model) {
		synchronized (cachedModels) {
			cachedModels.put(Pair.of(resourceId, model.type), model)
		}
	}
	
	def clear(String resourceId) {
		synchronized (cachedModels) {
			val iterator = cachedModels.entrySet.iterator
			while (iterator.hasNext) {
				val entry = iterator.next()
				if (entry.key == resourceId)
					iterator.remove()
			}
		}
	}
	
}
