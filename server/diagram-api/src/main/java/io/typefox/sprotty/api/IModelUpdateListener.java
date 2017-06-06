/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api;

/**
 * Listener for client model updates.
 */
public interface IModelUpdateListener {
	
	/**
	 * Called whenever a new model has been sent to the client.
	 */
	void modelSent(SModelRoot newRoot, SModelRoot oldRoot, IDiagramServer server);
	
	/**
	 * An implementation that does nothing.
	 */
	public static class NullImpl implements IModelUpdateListener {
		@Override
		public void modelSent(SModelRoot newRoot, SModelRoot oldRoot, IDiagramServer server) {
		}
	}

}
