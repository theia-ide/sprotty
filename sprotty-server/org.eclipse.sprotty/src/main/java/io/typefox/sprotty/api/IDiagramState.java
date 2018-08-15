package io.typefox.sprotty.api;

import java.util.Map;
import java.util.Set;

/**
 * A view on the current state of the diagram.
 * 
 * @author koehnlein
 */
public interface IDiagramState {
	/**
	 * The options received from the client with the last {@link RequestModelAction}. These options
	 * can be used to control diagram creation. If no such action has been received yet, or the action did
	 * not contain any options, an empty map is returned.
	 */
	Map<String, String> getOptions();
	
	/**
	 * @return the identifier of the client attached to this server.
	 */
	String getClientId();
	
	/**
	 * @return the current model
	 */
	SModelRoot getCurrentModel();
	
	/**
	 * @return the IDs of the currently expanded {@link SModelElement}s.
	 */
	Set<String> getExpandedElements();

	/**
	 * @return the IDs of the currently selected {@link SModelElement}s.
	 */
	Set<String> getSelectedElements();
	
}