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
	def Bounds getBounds()
	def void setBounds(Bounds bounds)
	
	def Boolean getRevalidateBounds()
	def void setRevalidateBounds(Boolean revalidateBounds)
}