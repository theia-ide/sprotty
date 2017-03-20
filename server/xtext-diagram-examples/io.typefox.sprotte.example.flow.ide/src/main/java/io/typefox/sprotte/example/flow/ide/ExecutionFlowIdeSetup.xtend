package io.typefox.sprotte.example.flow.ide

import com.google.inject.Guice
import io.typefox.sprotte.example.flow.ExecutionFlowRuntimeModule
import io.typefox.sprotte.example.flow.ExecutionFlowStandaloneSetup
import org.eclipse.xtext.util.Modules2

/**
 * Initialization support for running Xtext languages as language servers.
 */
class ExecutionFlowIdeSetup extends ExecutionFlowStandaloneSetup {

	override createInjector() {
		Guice.createInjector(Modules2.mixin(new ExecutionFlowRuntimeModule, new ExecutionFlowIdeModule))
	}
	
}
