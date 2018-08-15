/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api;

/**
 * A layout engine is able to compute layout information for a model. Invoked by {@link DefaultDiagramServer}
 * when {@link DefaultDiagramServer#needsServerLayout(SModelRoot)} returns {@code true}.
 */
public interface ILayoutEngine {
	
	/**
	 * Compute a layout for the given model and modify the model accordingly.
	 */
	public void layout(SModelRoot root);
	
	/**
	 * An implementation that does nothing.
	 */
	public static class NullImpl implements ILayoutEngine {
		@Override
		public void layout(SModelRoot root) {
		}
	}

}
