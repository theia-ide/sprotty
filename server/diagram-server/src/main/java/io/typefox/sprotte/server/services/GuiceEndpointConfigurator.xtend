package io.typefox.sprotte.server.services

import com.google.inject.Inject
import com.google.inject.Injector
import javax.websocket.server.ServerEndpointConfig.Configurator

class GuiceEndpointConfigurator extends Configurator {
    
    @Inject
    static Injector injector
    
    override <T> getEndpointInstance(Class<T> endpointClass) throws InstantiationException {
        injector.getInstance(endpointClass)
    }
    
}