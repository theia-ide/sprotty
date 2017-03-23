package io.typefox.sprotty.example.multicore

import io.typefox.sprotty.example.multicore.conversion.MulticoreAllocationValueConverterService

/**
 * Use this class to register components to be used at runtime / without the Equinox extension registry.
 */
class MulticoreAllocationRuntimeModule extends AbstractMulticoreAllocationRuntimeModule {
	
	override bindIValueConverterService() {
		MulticoreAllocationValueConverterService
	}
	
}
