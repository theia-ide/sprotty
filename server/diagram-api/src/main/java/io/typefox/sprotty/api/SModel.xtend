package io.typefox.sprotty.api

import java.util.List
import java.util.function.Consumer
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.EqualsHashCode
import org.eclipse.xtend.lib.annotations.ToString

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
class SGraph extends SModelRoot implements BoundsAware {
	Bounds bounds
	Boolean revalidateBounds

	new() {}
	new(Consumer<SGraph> initializer) {
		initializer.accept(this)
	}
}

@Accessors@EqualsHashCode@ToString
class SNode extends SModelElement implements BoundsAware  {
	Bounds bounds
	
	Boolean revalidateBounds
	
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
