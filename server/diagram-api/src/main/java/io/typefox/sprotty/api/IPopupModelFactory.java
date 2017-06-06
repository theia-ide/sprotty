/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api;

/**
 * Factory for hover popup contents.
 */
public interface IPopupModelFactory {
	
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
