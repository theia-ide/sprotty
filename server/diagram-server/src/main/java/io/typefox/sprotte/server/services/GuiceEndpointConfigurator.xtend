package io.typefox.sprotte.server.services

import com.google.inject.Injector
import javax.websocket.server.ServerEndpointConfig.Configurator
import org.eclipse.xtend.lib.annotations.FinalFieldsConstructor

@FinalFieldsConstructor
class GuiceEndpointConfigurator extends Configurator {
	
	val Injector injector
    
    override <T> getEndpointInstance(Class<T> endpointClass) throws InstantiationException {
        injector.getInstance(endpointClass)
    }
    
}