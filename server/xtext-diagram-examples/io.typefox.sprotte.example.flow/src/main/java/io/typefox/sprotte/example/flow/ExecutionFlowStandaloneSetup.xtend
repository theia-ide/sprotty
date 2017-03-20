package io.typefox.sprotte.example.flow


/**
 * Initialization support for running Xtext languages without Equinox extension registry.
 */
class ExecutionFlowStandaloneSetup extends ExecutionFlowStandaloneSetupGenerated {

	def static void doSetup() {
		new ExecutionFlowStandaloneSetup().createInjectorAndDoEMFRegistration()
	}
}
