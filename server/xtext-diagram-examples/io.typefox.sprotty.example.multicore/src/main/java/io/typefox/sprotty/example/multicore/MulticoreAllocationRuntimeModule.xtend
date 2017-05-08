package io.typefox.sprotty.example.multicore

import io.typefox.sprotty.example.multicore.scoping.MulticoreAllocationQualifiedNameProvider

/**
 * Use this class to register components to be used at runtime / without the Equinox extension registry.
 */
class MulticoreAllocationRuntimeModule extends AbstractMulticoreAllocationRuntimeModule {
	
	override bindIQualifiedNameProvider() {
		MulticoreAllocationQualifiedNameProvider
	}
	
}
