package io.typefox.sprotty.example.multicore.web.diagram

import io.typefox.sprotty.api.SModelElement
import io.typefox.sprotty.api.SModelRoot
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.EqualsHashCode
import org.eclipse.xtend.lib.annotations.ToString

@Accessors@EqualsHashCode@ToString
class Processor extends SModelRoot {
	int rows
	int columns
}

@Accessors@EqualsHashCode@ToString
class Core extends SModelElement {
	int row
	int column
}

@Accessors@EqualsHashCode@ToString
class AllocatedTask extends SModelElement {
	int kernelNr
	String stackSize
}

@Accessors@EqualsHashCode@ToString
class Crossbar extends SModelElement {
	CoreDirection direction
}

@Accessors@EqualsHashCode@ToString
class Channel extends SModelElement {
	int row
	int column
	CoreDirection direction
}

enum CoreDirection { left, right, up, down }
