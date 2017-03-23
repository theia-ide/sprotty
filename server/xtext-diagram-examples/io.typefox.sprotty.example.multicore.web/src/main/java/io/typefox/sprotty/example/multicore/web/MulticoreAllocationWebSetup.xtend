package io.typefox.sprotty.example.multicore.web

import com.google.inject.Guice
import com.google.inject.Injector
import io.typefox.sprotty.example.multicore.MulticoreAllocationRuntimeModule
import io.typefox.sprotty.example.multicore.MulticoreAllocationStandaloneSetup
import io.typefox.sprotty.example.multicore.ide.MulticoreAllocationIdeModule
import org.eclipse.xtext.util.Modules2

/**
 * Initialization support for running Xtext languages in web applications.
 */
class MulticoreAllocationWebSetup extends MulticoreAllocationStandaloneSetup {
	
	override Injector createInjector() {
		return Guice.createInjector(Modules2.mixin(new MulticoreAllocationRuntimeModule, new MulticoreAllocationIdeModule, new MulticoreAllocationWebModule))
	}
	
}
