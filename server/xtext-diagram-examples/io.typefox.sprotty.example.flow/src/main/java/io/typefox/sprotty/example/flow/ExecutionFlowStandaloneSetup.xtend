package io.typefox.sprotty.example.flow


/**
 * Initialization support for running Xtext languages without Equinox extension registry.
 */
class ExecutionFlowStandaloneSetup extends ExecutionFlowStandaloneSetupGenerated {

	def static void doSetup() {
		new ExecutionFlowStandaloneSetup().createInjectorAndDoEMFRegistration()
	}
}
