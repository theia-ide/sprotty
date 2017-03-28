package io.typefox.sprotty.api

import java.util.List
import java.util.Map
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.EqualsHashCode
import org.eclipse.xtend.lib.annotations.ToString

interface Action {
	def String getKind()
}

@Accessors@EqualsHashCode@ToString
class RequestModelAction implements Action {
	public static val KIND = 'requestModel'
	String kind = KIND
	Map<String, String> options
}

@Accessors@EqualsHashCode@ToString
class ResizeAction implements Action {
    public static val KIND ='resize'
	String kind = KIND
	List<ElementResize> resizes
}

@Accessors@EqualsHashCode@ToString
class ElementResize {
    String elementId
    Bounds newBounds
}

@Accessors@EqualsHashCode@ToString
class SetModelAction implements Action {
	public static val KIND = 'setModel'
	String kind = KIND
	SModelRoot newRoot
}

@Accessors@EqualsHashCode@ToString
class SelectAction implements Action {
	public static val KIND = 'elementSelected'
	String kind = KIND
	List<String> selectedElementsIDs
	List<String> deselectedElementsIDs
}

@Accessors@EqualsHashCode@ToString
class UpdateModelAction implements Action {
	public static val KIND = 'updateModel'
	String kind = KIND
	String modelId
}

@Accessors@EqualsHashCode@ToString
abstract class SModelElement {
	String type
	String id
	List<SModelElement> children
}

@Accessors@EqualsHashCode@ToString
class SModelRoot extends SModelElement {
}

@Accessors@EqualsHashCode@ToString
class SGraph extends SModelRoot {
	Double width
	Double height
	Boolean autosize
}

@Accessors@EqualsHashCode@ToString
class SNode extends SModelElement {
	Double x
	Double y
	Double width
	Double height
	Boolean autosize
}

@Accessors@EqualsHashCode@ToString
class SEdge extends SModelElement {
	String sourceId
	String targetId
	List<Point> routingPoints
}

@Accessors@EqualsHashCode@ToString
class Point {
    Double x
    Double y
}

@Accessors@EqualsHashCode@ToString
class Dimension {
    Double width
    Double height
}

@Accessors@EqualsHashCode@ToString
class Bounds {
    Double x
    Double y
    Double width
    Double height
}
