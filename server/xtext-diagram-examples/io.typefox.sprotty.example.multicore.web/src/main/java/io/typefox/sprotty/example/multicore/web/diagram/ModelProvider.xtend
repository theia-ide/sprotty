package io.typefox.sprotty.example.multicore.web.diagram

import com.google.inject.Singleton
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.EqualsHashCode
import org.eclipse.xtend.lib.annotations.ToString
import org.eclipse.xtext.web.server.IServiceResult

/**
 * Here the access to the models is hard-coded with a singleton provider.
 */
@Singleton
@Accessors
@EqualsHashCode
@ToString
class ModelProvider implements IServiceResult {
	
	Flow flowView
	
	Processor processorView
	
}
