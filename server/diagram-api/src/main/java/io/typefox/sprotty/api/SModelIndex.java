/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api;

import java.util.HashMap;
import java.util.Map;

public class SModelIndex {
	
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

	public SModelIndex(SModelElement parent) {
		index = new HashMap<>();
		addToIndex(parent);
	}
	
	public SModelElement get(String elementId) {
		return index.get(elementId);
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