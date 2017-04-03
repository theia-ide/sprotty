package io.typefox.sprotty.api

import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.EqualsHashCode
import org.eclipse.xtend.lib.annotations.ToString

@Accessors@EqualsHashCode@ToString
class Point {
    Double x
    Double y
	
	new() {}
	new(double x, double y) {
		this.x = x
		this.y = y
	}
}

@Accessors@EqualsHashCode@ToString
class Dimension {
    Double width
    Double height
	
	new() {}
	new(double width, double height) {
		this.width = width
		this.height = height
	}
}

@Accessors@EqualsHashCode@ToString
class Bounds {
    Double x
    Double y
    Double width
    Double height
	
	new() {}
	new(double x, double y, double width, double height) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
	}
}
