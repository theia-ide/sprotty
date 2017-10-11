/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api;

/**
 * Listener for diagram expand/collapse changes. Invoked by {@link DefaultDiagramServer}.
 */
public interface IDiagramExpansionListener {
	
	/**
	 * Called whenever the client has notified a change in the expansion state.
	 */
	void expansionChanged(Action action, IDiagramServer server);

	/**
	 * An implementation that does nothing.
	 */
	public static class NullImpl implements IDiagramExpansionListener {

		@Override
		public void expansionChanged(Action action, IDiagramServer server) {
		}
	}
}
