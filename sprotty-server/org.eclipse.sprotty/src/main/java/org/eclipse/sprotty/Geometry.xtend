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
package org.eclipse.sprotty

import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.EqualsHashCode
import org.eclipse.xtend.lib.annotations.ToString

/**
 * A Point is composed of the (x,y) coordinates of an object.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
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

/**
 * The Dimension of an object is composed of its width and height.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
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
	
	def boolean isValid() {
		width >= 0 && height >= 0
	}
}

/**
 * The bounds are the position (x, y) and dimension (width, height) of an object.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
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

/**
 * Model elements that implement this interface have a position and a size.
 */
interface BoundsAware {
	def Point getPosition()
	def void setPosition(Point position)
	def Dimension getSize()
	def void setSize(Dimension size)
}

/**
 * Used to adjust elements whose bounding box is not at the origin, e.g.
 * labels, or pre-rendered SVG figures.
 */
interface Alignable {
	def Point getAlignment()
	def void setAlignment(Point alignment)
}

/**
 * Used to identify model elements that specify a <em>client</em> layout to apply to their children.
 * The children of such elements are ignored by the server-side layout engine because they are
 * already handled by the client.
 */
interface Layouting {
	def String getLayout()
	def LayoutOptions getLayoutOptions()
}
