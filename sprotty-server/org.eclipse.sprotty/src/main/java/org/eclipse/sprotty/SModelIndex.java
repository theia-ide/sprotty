/********************************************************************************
 * Copyright (c) 2017-2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
package org.eclipse.sprotty;

import java.util.HashMap;
import java.util.Map;

/**
 * Utility class that stores all model elements by their id. Use this for fast model element lookup.
 */
public class SModelIndex {
	
	/**
	 * Find a single model element without building an index first. If you need to find multiple
	 * elements, creating an {@link SModelIndex} instance is more effective.
	 */
	public static SModelElement find(SModelElement parent, String elementId) {
		if (elementId != null) {
			if (elementId.equals(parent.getId()))
				return parent;
			if (parent.getChildren() != null) {
				for (SModelElement child : parent.getChildren()) {
					SModelElement result = find(child, elementId);
					if (result != null)
						return result;
				}
			}
		}
		return null;
	}
	
	private final Map<String, SModelElement> index;

	/**
	 * Build an index from the given parent element. All content of the element is included recursively.
	 */
	public SModelIndex(SModelElement parent) {
		index = new HashMap<>();
		addToIndex(parent);
	}
	
	/**
	 * Get the element with the given id. Returns {@code null} if such an element does not exist.
	 */
	public SModelElement get(String elementId) {
		return index.get(elementId);
	}
	
	/**
	 * @return all IDs
	 */
	public Iterable<String> allIds() {
		return index.keySet();
	}
	
	protected void addToIndex(SModelElement element) {
		index.put(element.getId(), element);
		if (element.getChildren() != null) {
			for (SModelElement child : element.getChildren()) {
				addToIndex(child);
			}
		}
	}
}