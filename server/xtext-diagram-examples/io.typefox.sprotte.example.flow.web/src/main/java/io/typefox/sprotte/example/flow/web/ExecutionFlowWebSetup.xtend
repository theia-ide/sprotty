package io.typefox.sprotte.example.flow.web

import com.google.inject.Guice
import com.google.inject.Injector
import io.typefox.sprotte.example.flow.ExecutionFlowRuntimeModule
import io.typefox.sprotte.example.flow.ExecutionFlowStandaloneSetup
import io.typefox.sprotte.example.flow.ide.ExecutionFlowIdeModule
import org.eclipse.xtext.util.Modules2

/**
 * Initialization support for running Xtext languages in web applications.
 */
class ExecutionFlowWebSetup extends ExecutionFlowStandaloneSetup {
	
	override Injector createInjector() {
		return Guice.createInjector(Modules2.mixin(new ExecutionFlowRuntimeModule, new ExecutionFlowIdeModule, new ExecutionFlowWebModule))
	}
	
}
