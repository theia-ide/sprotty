/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api;

/**
 * Factory for hover popup contents. Invoked by {@link DefaultDiagramServer} when a hover popup is requested
 * by the client.
 */
public interface IPopupModelFactory {
	
	/**
	 * Create a model to be displayed in a hover popup. Return {@code null} if no popup should be shown for the
	 * given request.
	 * 
	 * @param element - the model element referenced by the request, or {@code null} if no such element exists
	 */
	SModelRoot createPopupModel(SModelElement element, RequestPopupModelAction request, IDiagramServer server);
	
	/**
	 * An implementation that does nothing.
	 */
	public static class NullImpl implements IPopupModelFactory {
		@Override
		public SModelRoot createPopupModel(SModelElement element, RequestPopupModelAction request,
				IDiagramServer server) {
			return null;
		}
	}

}
