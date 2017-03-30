package io.typefox.sprotty.api

import java.util.List
import java.util.Map
import java.util.function.Consumer
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.EqualsHashCode
import org.eclipse.xtend.lib.annotations.ToString

interface Action {
	def String getKind()
}

@Accessors@EqualsHashCode@ToString
class ActionMessage {
	String clientId
	Action action
	
	new() {}
	new(Consumer<ActionMessage> initializer) {
		initializer.accept(this)
	}
}

@Accessors@EqualsHashCode@ToString
class RequestModelAction implements Action {
	public static val KIND = 'requestModel'
	String kind = KIND
	String modelType
	String modelId
	Map<String, String> options
	
	new() {}
	new(Consumer<RequestModelAction> initializer) {
		initializer.accept(this)
	}
}

@Accessors@EqualsHashCode@ToString
class SetBoundsAction implements Action {
    public static val KIND ='setBounds'
	String kind = KIND
	List<ElementAndBounds> resizes
	
	new() {}
	new(Consumer<SetBoundsAction> initializer) {
		initializer.accept(this)
	}
}

@Accessors@EqualsHashCode@ToString
class ElementAndBounds {
    String elementId
    Bounds newBounds
	
	new() {}
	new(Consumer<ElementAndBounds> initializer) {
		initializer.accept(this)
	}
}

@Accessors@EqualsHashCode@ToString
class SetModelAction implements Action {
	public static val KIND = 'setModel'
	String kind = KIND
	SModelRoot newRoot
	String modelType
	String modelId
	
	new() {}
	new(Consumer<SetModelAction> initializer) {
		initializer.accept(this)
	}
}

@Accessors@EqualsHashCode@ToString
class SelectAction implements Action {
	public static val KIND = 'elementSelected'
	String kind = KIND
	List<String> selectedElementsIDs
	List<String> deselectedElementsIDs
	
	new() {}
	new(Consumer<SelectAction> initializer) {
		initializer.accept(this)
	}
}

@Accessors@EqualsHashCode@ToString
class UpdateModelAction implements Action {
	public static val KIND = 'updateModel'
	String kind = KIND
	String modelType
	String modelId
	
	new() {}
	new(Consumer<UpdateModelAction> initializer) {
		initializer.accept(this)
	}
}

@Accessors@EqualsHashCode@ToString
abstract class SModelElement {
	String type
	String id
	List<SModelElement> children
	
	new() {}
	new(Consumer<SModelElement> initializer) {
		initializer.accept(this)
	}
}

@Accessors@EqualsHashCode@ToString
class SModelRoot extends SModelElement {
	new() {}
	new(Consumer<SModelRoot> initializer) {
		initializer.accept(this)
	}
}

@Accessors@EqualsHashCode@ToString
class SGraph extends SModelRoot {
	new() {}
	new(Consumer<SGraph> initializer) {
		initializer.accept(this)
	}
	Bounds bounds
}

@Accessors@EqualsHashCode@ToString
class SNode extends SModelElement {
	Double x
	Double y
	Double width
	Double height
	
	new() {}
	new(Consumer<SNode> initializer) {
		initializer.accept(this)
	}
}

@Accessors@EqualsHashCode@ToString
class SEdge extends SModelElement {
	String sourceId
	String targetId
	List<Point> routingPoints
	
	new() {}
	new(Consumer<SEdge> initializer) {
		initializer.accept(this)
	}
}

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
