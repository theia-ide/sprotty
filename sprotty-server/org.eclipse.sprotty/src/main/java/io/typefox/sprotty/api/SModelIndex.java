/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api;

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