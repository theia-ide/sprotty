/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api

import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.EqualsHashCode
import org.eclipse.xtend.lib.annotations.ToString

@Accessors@EqualsHashCode@ToString
class Point {
    double x
    double y
	
	new() {}
	new(double x, double y) {
		this.x = x
		this.y = y
	}
	new(Point other) {
		this.x = other.x
		this.y = other.y
	}
}

@Accessors@EqualsHashCode@ToString
class Dimension {
    double width = -1
    double height = -1
	
	new() {}
	new(double width, double height) {
		this.width = width
		this.height = height
	}
	new(Dimension other) {
		this.width = other.width
		this.height = other.height
	}
}

@Accessors@EqualsHashCode@ToString
class Bounds {
    double x
    double y
    double width = -1
    double height = -1
	
	new() {}
	new(double x, double y, double width, double height) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
	}
}

interface BoundsAware {
	def Point getPosition()
	def void setPosition(Point position)
	def Dimension getSize()
	def void setSize(Dimension size)
}
