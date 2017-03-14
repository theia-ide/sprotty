package io.typefox.sprotte.example.multicore


/**
 * Initialization support for running Xtext languages without Equinox extension registry.
 */
class MulticoreAllocationStandaloneSetup extends MulticoreAllocationStandaloneSetupGenerated {

	def static void doSetup() {
		new MulticoreAllocationStandaloneSetup().createInjectorAndDoEMFRegistration()
	}
}
