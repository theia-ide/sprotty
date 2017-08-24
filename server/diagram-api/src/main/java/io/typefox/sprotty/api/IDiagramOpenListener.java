/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api;

/**
 * Listener for diagram open actions. Invoked by {@link DefaultDiagramServer}.
 * 
 * @author koehnlein
 */
public interface IDiagramOpenListener {

	/**
	 * Called whenever the client has notified a new selection.
	 */
	void elementOpened(OpenAction action, IDiagramServer server);
	
	/**
	 * An implementation that does nothing.
	 */
	public static class NullImpl implements IDiagramOpenListener {
		@Override
		public void elementOpened(OpenAction action, IDiagramServer server) {
		}
	}
}
