package io.typefox.sprotty.server.websocket;

import javax.websocket.server.ServerEndpointConfig.Configurator;

import com.google.inject.Injector;

public class GuiceEndpointConfigurator extends Configurator {
	
	private final Injector injector;
	
	public GuiceEndpointConfigurator(Injector injector) {
		this.injector = injector;
	}
    
    @Override
    public <T> T getEndpointInstance(Class<T> endpointClass) {
        return injector.getInstance(endpointClass);
    }
    
}
