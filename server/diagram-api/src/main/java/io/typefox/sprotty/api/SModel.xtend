/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api

import java.util.List
import java.util.function.Consumer
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.ToString

@Accessors@ToString
abstract class SModelElement {
	String type
	String id
	List<SModelElement> children
	
	new() {}
	new(Consumer<SModelElement> initializer) {
		initializer.accept(this)
	}
}

@Accessors@ToString
class SModelRoot extends SModelElement {
	Bounds canvasBounds
	
	new() {}
	new(Consumer<SModelRoot> initializer) {
		initializer.accept(this)
	}
}

@Accessors@ToString
class SGraph extends SModelRoot implements BoundsAware {
	Point position
	Dimension size

	new() {}
	new(Consumer<SGraph> initializer) {
		initializer.accept(this)
	}
}

@Accessors@ToString
class SNode extends SModelElement implements BoundsAware  {
	Point position
	Dimension size
	
	new() {}
	new(Consumer<SNode> initializer) {
		initializer.accept(this)
	}
}

@Accessors@ToString
class SEdge extends SModelElement {
	String sourceId
	String targetId
	List<Point> routingPoints
	
	new() {}
	new(Consumer<SEdge> initializer) {
		initializer.accept(this)
	}
}

@Accessors@ToString
class SCompartment extends SModelElement {
	String layout
	Boolean resizeContainer
	
	new() {}
	new(Consumer<SCompartment> initializer) {
		initializer.accept(this)
	}
}

@Accessors@ToString
class SLabel extends SModelElement implements BoundsAware  {
	Point position
	Dimension size
	String text
	
	new() {}
	new(Consumer<SLabel> initializer) {
		initializer.accept(this)
	}
}

@Accessors@ToString
class HtmlRoot extends SModelRoot {
    List<String> classes
	
	new() {}
	new(Consumer<HtmlRoot> initializer) {
		initializer.accept(this)
	}
}

@Accessors@ToString
class PreRenderedElement extends SModelElement {
	String code
	
	new() {}
	new(Consumer<PreRenderedElement> initializer) {
		initializer.accept(this)
	}
}
