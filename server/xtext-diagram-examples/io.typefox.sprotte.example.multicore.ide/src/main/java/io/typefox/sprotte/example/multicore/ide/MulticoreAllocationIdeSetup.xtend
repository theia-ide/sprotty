package io.typefox.sprotte.example.multicore.ide

import com.google.inject.Guice
import io.typefox.sprotte.example.multicore.MulticoreAllocationRuntimeModule
import io.typefox.sprotte.example.multicore.MulticoreAllocationStandaloneSetup
import org.eclipse.xtext.util.Modules2

/**
 * Initialization support for running Xtext languages as language servers.
 */
class MulticoreAllocationIdeSetup extends MulticoreAllocationStandaloneSetup {

	override createInjector() {
		Guice.createInjector(Modules2.mixin(new MulticoreAllocationRuntimeModule, new MulticoreAllocationIdeModule))
	}
	
}
