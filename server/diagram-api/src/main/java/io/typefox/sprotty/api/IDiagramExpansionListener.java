package io.typefox.sprotty.api;

/**
 * Listener for diagram expand/collapse changes. Invoked by {@link DefaultDiagramServer}.
 */
public interface IDiagramExpansionListener {
	
	/**
	 * Called whenever the client has notified a change in the expansion state.
	 */
	void expansionChanged(CollapseExpandAction action, IDiagramServer server);

	/**
	 * An implementation that does nothing.
	 */
	public static class NullImpl implements IDiagramExpansionListener {

		@Override
		public void expansionChanged(CollapseExpandAction action, IDiagramServer server) {
		}
	}
}
